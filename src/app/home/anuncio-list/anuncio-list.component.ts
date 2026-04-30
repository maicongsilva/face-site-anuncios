import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Anuncio } from 'src/app/shared/model/anuncio.model';
import { AnuncioService } from 'src/app/shared/model/service/anuncio.service';
import { AuthService } from 'src/app/shared/model/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-anuncio-list',
  templateUrl: './anuncio-list.component.html',
  styleUrls: ['./anuncio-list.component.scss']
})
export class AnuncioListComponent implements OnInit, OnDestroy {
  cards: Array<Anuncio & { image: string; isNovo: boolean }> = [];
  loading = true;
  feedback = '';
  filtroTermo = '';
  filtroCategoria = '';
  filtroLocalizacao = '';
  filtroPrecoMin: number | null = null;
  filtroPrecoMax: number | null = null;
  paginaAtual = 0;
  totalPaginas = 0;
  totalResultados = 0;
  readonly pageSize = 6;
  ordenacao = 'dataCriacao,desc';
  readonly categoriasRapidas = ['Tecnologia', 'Móveis', 'Esporte', 'Imóveis'];
  private routeSub?: Subscription;

  constructor(
    private anuncioService: AnuncioService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.filtroTermo = params['q'] || '';
      this.filtroCategoria = params['categoria'] || '';
      this.filtroLocalizacao = params['localizacao'] || '';
      this.filtroPrecoMin = params['precoMin'] ? Number(params['precoMin']) : null;
      this.filtroPrecoMax = params['precoMax'] ? Number(params['precoMax']) : null;
      this.ordenacao = params['ord'] || 'dataCriacao,desc';
      this.paginaAtual = params['pagina'] ? Number(params['pagina']) : 0;
      this.carregarAnuncios();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  aplicarFiltros(): void {
    this.navegarComFiltros(0);
  }

  limparFiltros(): void {
    this.router.navigate(['/'], { queryParams: {} });
  }

  alterarOrdenacao(event: Event): void {
    this.ordenacao = (event.target as HTMLSelectElement).value;
    this.navegarComFiltros(0);
  }

  aplicarCategoriaRapida(categoria: string): void {
    this.filtroCategoria = this.filtroCategoria === categoria ? '' : categoria;
    this.navegarComFiltros(0);
  }

  irParaPaginaAnterior(): void {
    if (this.paginaAtual === 0) return;
    this.navegarComFiltros(this.paginaAtual - 1);
  }

  irParaProximaPagina(): void {
    if (this.paginaAtual >= this.totalPaginas - 1) return;
    this.navegarComFiltros(this.paginaAtual + 1);
  }

  irParaPagina(pagina: number): void {
    if (pagina === this.paginaAtual) return;
    this.navegarComFiltros(pagina);
  }

  private navegarComFiltros(pagina: number): void {
    const qp: Record<string, string | number> = {};
    if (this.filtroTermo.trim()) qp['q'] = this.filtroTermo.trim();
    if (this.filtroCategoria.trim()) qp['categoria'] = this.filtroCategoria.trim();
    if (this.filtroLocalizacao.trim()) qp['localizacao'] = this.filtroLocalizacao.trim();
    if (this.filtroPrecoMin !== null) qp['precoMin'] = this.filtroPrecoMin;
    if (this.filtroPrecoMax !== null) qp['precoMax'] = this.filtroPrecoMax;
    if (this.ordenacao !== 'dataCriacao,desc') qp['ord'] = this.ordenacao;
    if (pagina > 0) qp['pagina'] = pagina;
    this.router.navigate(['/'], { queryParams: qp });
  }

  voltarAoTopo(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageButtons(): (number | '...')[] {
    if (this.totalPaginas <= 7) {
      return Array.from({ length: this.totalPaginas }, (_, i) => i);
    }
    const cur = this.paginaAtual;
    const last = this.totalPaginas - 1;
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(last - 1, cur + 1); i++) {
      pages.push(i);
    }
    if (cur < last - 2) pages.push('...');
    pages.push(last);
    return pages;
  }

  get precoInvalido(): boolean {
    return !!this.filtroPrecoMin && !!this.filtroPrecoMax
      && this.filtroPrecoMax < this.filtroPrecoMin;
  }

  atualizarCampoTexto(campo: 'filtroTermo' | 'filtroCategoria' | 'filtroLocalizacao', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this[campo] = value;
  }

  atualizarCampoNumero(campo: 'filtroPrecoMin' | 'filtroPrecoMax', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this[campo] = value ? Number(value) : null;
  }

  toggleFavorito(card: Anuncio & { image: string }): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!card.id) {
      return;
    }

    this.anuncioService.toggleFavorito(card.id).subscribe({
      next: (updated) => {
        this.cards = this.cards.map((item) => item.id === updated.id
          ? {
              ...updated,
              image: updated.imagemUrl || this.getImageByCategory(updated.categoria),
              isNovo: item.isNovo
            }
          : item);
        const msg = updated.favoritado ? 'Adicionado aos favoritos' : 'Removido dos favoritos';
        this.snack.open(msg, '', { duration: 2500 });
      },
      error: () => {
        this.snack.open('Não foi possível atualizar os favoritos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private carregarAnuncios(): void {
    this.loading = true;
    this.feedback = '';
    this.voltarAoTopo();

    const [sortBy, direction] = this.ordenacao.split(',');

    this.anuncioService.listarPublicos({
      termo: this.filtroTermo,
      categoria: this.filtroCategoria,
      localizacao: this.filtroLocalizacao,
      precoMin: this.filtroPrecoMin,
      precoMax: this.filtroPrecoMax
    }, this.paginaAtual, this.pageSize, sortBy, direction).subscribe({
      next: (response) => {
        this.cards = response.content.map((anuncio) => ({
          ...anuncio,
          image: anuncio.imagemUrl || this.getImageByCategory(anuncio.categoria),
          isNovo: this.isAnuncioNovo(anuncio.dataCriacao)
        }));
        this.totalPaginas = response.totalPages;
        this.totalResultados = response.totalElements;
        this.feedback = response.totalElements ? '' : 'Nenhum anúncio encontrado com os filtros informados.';
        this.loading = false;
      },
      error: () => {
        this.feedback = 'Não foi possível carregar os anúncios agora.';
        this.loading = false;
      }
    });
  }

  private getImageByCategory(categoria: string): string {
    const value = categoria?.toLowerCase() || '';

    if (value.includes('tecn')) {
      return 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80';
    }

    if (value.includes('im')) {
      return 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80';
    }

    return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80';
  }

  private isAnuncioNovo(dataCriacao?: string): boolean {
    if (!dataCriacao) {
      return false;
    }

    const data = new Date(dataCriacao);
    const diferenca = Date.now() - data.getTime();
    const doisDiasEmMs = 2 * 24 * 60 * 60 * 1000;
    return diferenca <= doisDiasEmMs;
  }
}

