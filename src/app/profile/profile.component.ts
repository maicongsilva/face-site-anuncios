import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
import { catchError, Observable, of, Subscription, switchMap } from 'rxjs';
import { compressImage, MAX_IMAGES_PER_ANUNCIO, MAX_UPLOAD_TOTAL_BYTES, readAsDataUrl } from '../shared/utils/image-compress.utils';
import { AuthService } from '../shared/model/service/auth.service';
import { AuthUser } from '../shared/model/auth.model';
import { Anuncio, TipoCobranca } from '../shared/model/anuncio.model';
import { ChatThread } from '../shared/model/chat-thread.model';
import { AnuncioService } from '../shared/model/service/anuncio.service';
import { ChatService } from '../shared/model/service/chat.service';
import { ESTADOS_BR, formatLocalizacao, LocalidadeService, parseLocalizacao } from '../shared/model/service/localidade.service';
import { getErrorMessage } from '../shared/utils/error.utils';
import { toThumbnailUrl } from '../shared/utils/thumbnail.utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  readonly categoriasAnuncio = ['Tecnologia', 'Móveis', 'Esporte', 'Imóveis', 'Aulas', 'Serviços', 'Produtos', 'Veículos', 'Outros'];
  categoriaAtualLegada: string | null = null;
  currentUser$: Observable<AuthUser | null> = this.authService.currentUser$;
  meusAnuncios: Anuncio[] = [];
  meusFavoritos: Anuncio[] = [];
  minhasConversas: ChatThread[] = [];
  private unreadSubscription?: Subscription;
  private cidadesSubscription?: Subscription;
  submitting = false;
  updatingProfile = false;
  feedback = '';
  profileFeedback = '';
  editingId: number | null = null;
  previewImages: string[] = [];
  selectedGalleryFiles: File[] = [];
  processingImages = false;
  readonly thumb = (url?: string | null, width = 200) => toThumbnailUrl(url, width);
  uploadProgress: number | null = null;
  existingImages: string[] = [];
  private originalImages: string[] = [];
  private uploadFailed = false;
  private reorderFailed = false;
  currentImageUrl: string | null = null;
  readonly estados = ESTADOS_BR;
  cidades: string[] = [];
  cidadesFiltradas: string[] = [];
  carregandoCidades = false;
  cidadesErro = '';
  @ViewChild('anuncioFormDirective') private anuncioFormDirective?: FormGroupDirective;

  profileForm = this.fb.group({
    nome: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    documento: this.fb.control('', { nonNullable: true }),
    telefone: this.fb.control('', { nonNullable: true })
  });

  anuncioForm = this.fb.group({
    titulo: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    descricao: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    categoria: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    uf: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    cidade: this.fb.control('', { nonNullable: true, validators: [Validators.required, (control: AbstractControl) => this.cidadeNaListaValidator(control)] }),
    preco: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    tipoCobranca: this.fb.control<TipoCobranca>('UNICO', { nonNullable: true })
  });

  constructor(
    private authService: AuthService,
    private anuncioService: AnuncioService,
    private chatService: ChatService,
    private localidadeService: LocalidadeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.fetchMe().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          nome: user.nome || '',
          documento: user.documento || '',
          telefone: user.telefone || ''
        });
        this.carregarMeusAnuncios();
        this.carregarFavoritos();
        this.carregarConversas();
      },
      error: () => this.authService.logout()
    });

    this.unreadSubscription = this.chatService.unreadRefresh$.subscribe(() => this.carregarConversas());
  }

  ngOnDestroy(): void {
    this.unreadSubscription?.unsubscribe();
    this.cidadesSubscription?.unsubscribe();
  }

  salvarPerfil(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.updatingProfile = true;
    this.profileFeedback = '';

    const formValue = this.profileForm.getRawValue();
    this.authService.updateProfile({
      nome: formValue.nome,
      documento: formValue.documento || undefined,
      telefone: formValue.telefone || undefined
    }).subscribe({
      next: () => {
        this.updatingProfile = false;
        this.profileFeedback = 'Perfil atualizado com sucesso.';
      },
      error: () => {
        this.updatingProfile = false;
        this.profileFeedback = 'Não foi possível atualizar seu perfil agora.';
      }
    });
  }

  publicarAnuncio(): void {
    if (this.anuncioForm.invalid) {
      this.anuncioForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.feedback = '';

    const formValue = this.anuncioForm.getRawValue();
    const payload: Partial<Anuncio> = {
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      categoria: formValue.categoria,
      localizacao: formatLocalizacao(this.nomeCanonicoCidade(formValue.cidade) || formValue.cidade, formValue.uf),
      preco: Number(formValue.preco ?? 0),
      tipoCobranca: this.permiteTipoCobranca ? formValue.tipoCobranca : 'UNICO',
      imagemUrl: this.toRelativeImageUrl(this.currentImageUrl) || undefined
    };

    const request$ = this.editingId
      ? this.anuncioService.atualizar(this.editingId, payload)
      : this.anuncioService.criar(payload);

    request$.pipe(
      switchMap((anuncio) => {
        const galleryChanged = !!anuncio.id && !!this.editingId
          && this.existingImages.join('|') !== this.originalImages.join('|');
        if (!galleryChanged) {
          return of(anuncio);
        }

        return this.anuncioService.reorganizarImagens(
          anuncio.id as number,
          this.existingImages.map((url) => this.anuncioService.toStoredImageUrl(url))
        ).pipe(
          catchError(() => {
            this.uploadFailed = true;
            this.reorderFailed = true;
            return of(anuncio);
          })
        );
      }),
      switchMap((anuncio) => {
        if (this.uploadFailed || !this.selectedGalleryFiles.length || !anuncio.id) {
          return of(anuncio);
        }

        this.uploadProgress = 0;
        return this.anuncioService.uploadImagensComProgresso(
          anuncio.id,
          this.selectedGalleryFiles,
          (percent) => this.uploadProgress = percent
        ).pipe(
          catchError(() => {
            this.uploadFailed = true;
            return of(anuncio);
          })
        );
      })
    ).subscribe({
      next: (anuncio) => {
        const exists = this.meusAnuncios.some(item => item.id === anuncio.id);
        this.meusAnuncios = exists
          ? this.meusAnuncios.map(item => item.id === anuncio.id ? anuncio : item)
          : [anuncio, ...this.meusAnuncios];
        this.submitting = false;
        this.uploadProgress = null;

        if (this.uploadFailed) {
          // Mantém o anúncio em edição para o reenvio das fotos não duplicá-lo.
          this.uploadFailed = false;
          const reorderFailed = this.reorderFailed;
          this.reorderFailed = false;
          const pendingFiles = this.selectedGalleryFiles;
          const pendingPreviews = this.previewImages;
          this.editarAnuncio(anuncio);
          this.selectedGalleryFiles = pendingFiles;
          this.previewImages = pendingPreviews;
          this.feedback = reorderFailed
            ? 'O anúncio foi salvo, mas não foi possível aplicar a remoção ou a ordem das fotos. Ajuste-as novamente e salve; as fotos novas foram mantidas.'
            : 'O anúncio foi salvo, mas não foi possível enviar as fotos. Elas foram mantidas: salve novamente para tentar de novo.';
          return;
        }

        this.feedback = this.editingId ? 'Anúncio atualizado com sucesso.' : 'Anúncio publicado com sucesso.';
        this.resetFormulario();
      },
      error: (error) => {
        this.submitting = false;
        this.uploadProgress = null;
        this.feedback = getErrorMessage(error);
      }
    });
  }

  editarAnuncio(anuncio: Anuncio): void {
    this.editingId = anuncio.id || null;
    this.categoriaAtualLegada = this.categoriasAnuncio.includes(anuncio.categoria) ? null : anuncio.categoria;
    this.currentImageUrl = anuncio.imagemUrl || null;
    this.previewImages = [];
    this.existingImages = anuncio.imagens?.length ? [...anuncio.imagens] : (anuncio.imagemUrl ? [anuncio.imagemUrl] : []);
    this.originalImages = [...this.existingImages];
    this.selectedGalleryFiles = [];
    this.anuncioForm.patchValue({
      titulo: anuncio.titulo,
      descricao: anuncio.descricao,
      categoria: anuncio.categoria,
      preco: anuncio.preco,
      tipoCobranca: anuncio.tipoCobranca || 'UNICO'
    });
    this.preencherLocalizacao(anuncio.localizacao);
    if (parseLocalizacao(anuncio.localizacao)) {
      this.feedback = 'Editando anúncio selecionado.';
    }
  }

  onUfChange(): void {
    this.anuncioForm.controls.cidade.setValue('');
    this.carregarCidades(this.anuncioForm.controls.uf.value);
  }

  filtrarCidades(): void {
    const termo = this.normalizarTexto(this.anuncioForm.controls.cidade.value);
    const resultado = termo
      ? this.cidades.filter((cidade) => this.normalizarTexto(cidade).includes(termo))
      : this.cidades;
    this.cidadesFiltradas = resultado.slice(0, 100);
  }

  private normalizarTexto(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  private nomeCanonicoCidade(texto: string): string | undefined {
    const chave = this.normalizarTexto(texto);
    return chave ? this.cidades.find((cidade) => this.normalizarTexto(cidade) === chave) : undefined;
  }

  private cidadeNaListaValidator(control: AbstractControl): ValidationErrors | null {
    const valor = control.value as string;
    // Sem a lista do IBGE aceita texto livre; o backend valida o formato "Cidade, UF".
    if (!valor || this.cidadesErro || this.nomeCanonicoCidade(valor)) {
      return null;
    }
    return { cidadeInvalida: true };
  }

  private carregarCidades(uf: string, cidadeSelecionada = ''): void {
    this.cidadesSubscription?.unsubscribe();
    this.cidades = [];
    this.cidadesFiltradas = [];
    this.cidadesErro = '';
    if (!uf) {
      return;
    }
    this.carregandoCidades = true;
    this.cidadesSubscription = this.localidadeService.listarMunicipios(uf).subscribe({
      next: (cidades) => {
        this.cidades = cidades;
        this.carregandoCidades = false;
        const canonica = cidadeSelecionada ? this.nomeCanonicoCidade(cidadeSelecionada) : undefined;
        if (canonica) {
          this.anuncioForm.controls.cidade.setValue(canonica);
        }
        this.anuncioForm.controls.cidade.updateValueAndValidity();
        this.filtrarCidades();
      },
      error: () => {
        this.carregandoCidades = false;
        this.cidadesErro = 'Não foi possível carregar a lista de cidades. Digite o nome da cidade manualmente.';
        if (cidadeSelecionada) {
          this.anuncioForm.controls.cidade.setValue(cidadeSelecionada);
        }
        this.anuncioForm.controls.cidade.updateValueAndValidity();
      }
    });
  }

  private preencherLocalizacao(localizacao: string): void {
    const parsed = parseLocalizacao(localizacao);
    if (!parsed) {
      this.anuncioForm.patchValue({ uf: '', cidade: '' });
      this.cidades = [];
      this.cidadesFiltradas = [];
      this.feedback = 'Editando anúncio. Selecione novamente o estado e a cidade.';
      return;
    }
    this.anuncioForm.patchValue({ uf: parsed.uf, cidade: '' });
    this.carregarCidades(parsed.uf, parsed.cidade);
  }

  excluirAnuncio(anuncio: Anuncio): void {
    if (!anuncio.id || !window.confirm('Deseja excluir este anúncio?')) {
      return;
    }

    this.anuncioService.excluir(anuncio.id).subscribe({
      next: () => {
        this.meusAnuncios = this.meusAnuncios.filter(item => item.id !== anuncio.id);
        this.meusFavoritos = this.meusFavoritos.filter(item => item.id !== anuncio.id);
        if (this.editingId === anuncio.id) {
          this.resetFormulario();
        }
        this.feedback = 'Anúncio excluído com sucesso.';
      },
      error: () => {
        this.feedback = 'Não foi possível excluir o anúncio.';
      }
    });
  }

  removerFavorito(anuncio: Anuncio): void {
    if (!anuncio.id) {
      return;
    }

    this.anuncioService.toggleFavorito(anuncio.id).subscribe({
      next: () => {
        this.meusFavoritos = this.meusFavoritos.filter(item => item.id !== anuncio.id);
        this.feedback = 'Favorito removido com sucesso.';
      },
      error: () => {
        this.feedback = 'Não foi possível atualizar os favoritos agora.';
      }
    });
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) {
      return;
    }

    const remaining = MAX_IMAGES_PER_ANUNCIO - this.existingImages.length - this.selectedGalleryFiles.length;
    if (files.length > remaining) {
      this.feedback = `Limite de ${MAX_IMAGES_PER_ANUNCIO} fotos por anúncio.`;
      input.value = '';
      return;
    }

    if (files.some((item) => !this.allowedImageTypes.includes(item.type))) {
      this.feedback = 'Formato de imagem nao suportado. Use JPG, PNG, WEBP ou GIF.';
      input.value = '';
      return;
    }

    this.feedback = '';
    this.processingImages = true;
    try {
      const optimized = await Promise.all(files.map((item) => compressImage(item)));
      const totalBytes = [...this.selectedGalleryFiles, ...optimized].reduce((sum, item) => sum + item.size, 0);

      if (totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
        this.feedback = 'As imagens ainda ultrapassam 9 MB no total. Escolha menos imagens ou arquivos menores.';
        return;
      }

      const novasPrevias = await Promise.all(optimized.map((item) => readAsDataUrl(item)));
      this.selectedGalleryFiles = [...this.selectedGalleryFiles, ...optimized];
      this.previewImages = [...this.previewImages, ...novasPrevias];
    } finally {
      this.processingImages = false;
      // Permite escolher o mesmo arquivo de novo depois de removê-lo.
      input.value = '';
    }
  }

  removerImagemNova(index: number): void {
    this.selectedGalleryFiles = this.selectedGalleryFiles.filter((_, i) => i !== index);
    this.previewImages = this.previewImages.filter((_, i) => i !== index);
  }

  moverImagemNova(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.selectedGalleryFiles.length) {
      return;
    }
    const arquivos = [...this.selectedGalleryFiles];
    const previas = [...this.previewImages];
    [arquivos[index], arquivos[target]] = [arquivos[target], arquivos[index]];
    [previas[index], previas[target]] = [previas[target], previas[index]];
    this.selectedGalleryFiles = arquivos;
    this.previewImages = previas;
  }

  cancelarEdicao(): void {
    this.resetFormulario();
    this.feedback = 'Edição cancelada.';
  }

  readonly rotulosCobranca: Record<TipoCobranca, string> = {
    UNICO: 'Valor total / único',
    HORA: 'Por hora',
    DIA: 'Por dia / diária',
    MES: 'Por mês',
    PROJETO: 'Por projeto / serviço'
  };

  private readonly cobrancaPorCategoria: Record<string, TipoCobranca[]> = {
    'Aulas': ['HORA', 'DIA', 'MES', 'PROJETO'],
    'Serviços': ['HORA', 'DIA', 'MES', 'PROJETO', 'UNICO'],
    'Imóveis': ['UNICO', 'MES', 'DIA'],
    'Esporte': ['UNICO', 'HORA', 'MES'],
    'Tecnologia': ['UNICO', 'HORA', 'PROJETO'],
    'Outros': ['UNICO', 'HORA', 'DIA', 'MES', 'PROJETO']
  };

  get opcoesCobranca(): TipoCobranca[] {
    return this.cobrancaPorCategoria[this.anuncioForm.controls.categoria.value] ?? [];
  }

  get permiteTipoCobranca(): boolean {
    return this.opcoesCobranca.length > 0;
  }

  atualizarTipoCobranca(): void {
    const opcoes = this.opcoesCobranca;
    this.anuncioForm.controls.tipoCobranca.setValue(opcoes[0] ?? 'UNICO');
  }

  private resetFormulario(): void {
    this.editingId = null;
    this.categoriaAtualLegada = null;
    this.previewImages = [];
    this.existingImages = [];
    this.originalImages = [];
    this.selectedGalleryFiles = [];
    this.currentImageUrl = null;
    this.cidades = [];
    this.cidadesFiltradas = [];
    this.cidadesSubscription?.unsubscribe();
    this.carregandoCidades = false;
    this.cidadesErro = '';
    this.anuncioFormDirective?.resetForm({
      titulo: '',
      descricao: '',
      categoria: '',
      uf: '',
      cidade: '',
      preco: null,
      tipoCobranca: 'UNICO'
    });
  }

  private toRelativeImageUrl(url: string | null): string | undefined {
    return url ? this.anuncioService.toStoredImageUrl(url) : undefined;
  }

  moverImagem(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.existingImages.length) {
      return;
    }
    const lista = [...this.existingImages];
    [lista[index], lista[target]] = [lista[target], lista[index]];
    this.existingImages = lista;
    this.currentImageUrl = lista[0];
  }

  removerImagemExistente(index: number): void {
    this.existingImages = this.existingImages.filter((_, i) => i !== index);
    this.currentImageUrl = this.existingImages[0] || null;
  }

  private carregarMeusAnuncios(): void {
    this.anuncioService.listarMeus().subscribe({
      next: (anuncios) => this.meusAnuncios = anuncios,
      error: () => this.meusAnuncios = []
    });
  }

  private carregarFavoritos(): void {
    this.anuncioService.listarFavoritos().subscribe({
      next: (anuncios) => this.meusFavoritos = anuncios,
      error: () => this.meusFavoritos = []
    });
  }

  private carregarConversas(): void {
    this.chatService.listarConversas().subscribe({
      next: (conversas) => this.minhasConversas = conversas,
      error: () => this.minhasConversas = []
    });
  }
}
