import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../shared/model/service/auth.service';
import { AuthUser } from '../shared/model/auth.model';
import { Anuncio } from '../shared/model/anuncio.model';
import { AnuncioService } from '../shared/model/service/anuncio.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<AuthUser | null> = this.authService.currentUser$;
  meusAnuncios: Anuncio[] = [];
  meusFavoritos: Anuncio[] = [];
  submitting = false;
  updatingProfile = false;
  feedback = '';
  profileFeedback = '';
  editingId: number | null = null;
  previewImage: string | null = null;
  selectedImageFile: File | null = null;
  currentImageUrl: string | null = null;

  profileForm = this.fb.group({
    nome: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    documento: this.fb.control('', { nonNullable: true }),
    telefone: this.fb.control('', { nonNullable: true })
  });

  anuncioForm = this.fb.group({
    titulo: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    descricao: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    categoria: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    localizacao: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    preco: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)])
  });

  constructor(
    private authService: AuthService,
    private anuncioService: AnuncioService,
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
      },
      error: () => this.authService.logout()
    });
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
      localizacao: formValue.localizacao,
      preco: Number(formValue.preco ?? 0),
      imagemUrl: this.toRelativeImageUrl(this.currentImageUrl) || undefined
    };

    const request$ = this.editingId
      ? this.anuncioService.atualizar(this.editingId, payload)
      : this.anuncioService.criar(payload);

    request$.pipe(
      switchMap((anuncio) => {
        if (this.selectedImageFile && anuncio.id) {
          return this.anuncioService.uploadImagem(anuncio.id, this.selectedImageFile);
        }

        return of(anuncio);
      })
    ).subscribe({
      next: (anuncio) => {
        if (this.editingId) {
          this.meusAnuncios = this.meusAnuncios.map(item => item.id === anuncio.id ? anuncio : item);
          this.feedback = 'Anúncio atualizado com sucesso.';
        } else {
          this.meusAnuncios = [anuncio, ...this.meusAnuncios];
          this.feedback = 'Anúncio publicado com sucesso.';
        }

        this.submitting = false;
        this.resetFormulario();
      },
      error: () => {
        this.submitting = false;
        this.feedback = 'Não foi possível salvar o anúncio agora.';
      }
    });
  }

  editarAnuncio(anuncio: Anuncio): void {
    this.editingId = anuncio.id || null;
    this.currentImageUrl = anuncio.imagemUrl || null;
    this.previewImage = anuncio.imagemUrl || null;
    this.selectedImageFile = null;
    this.anuncioForm.patchValue({
      titulo: anuncio.titulo,
      descricao: anuncio.descricao,
      categoria: anuncio.categoria,
      localizacao: anuncio.localizacao,
      preco: anuncio.preco
    });
    this.feedback = 'Editando anúncio selecionado.';
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return;
    }

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  cancelarEdicao(): void {
    this.resetFormulario();
    this.feedback = 'Edição cancelada.';
  }

  private resetFormulario(): void {
    this.editingId = null;
    this.previewImage = null;
    this.selectedImageFile = null;
    this.currentImageUrl = null;
    this.anuncioForm.reset({
      titulo: '',
      descricao: '',
      categoria: '',
      localizacao: '',
      preco: null
    });
  }

  private toRelativeImageUrl(url: string | null): string | undefined {
    if (!url) {
      return undefined;
    }

    return url.replace(/^https?:\/\/[^/]+/, '');
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
}
