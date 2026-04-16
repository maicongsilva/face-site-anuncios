import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Anuncio } from 'src/app/shared/model/anuncio.model';
import { AnuncioService } from 'src/app/shared/model/service/anuncio.service';
import { AuthService } from 'src/app/shared/model/service/auth.service';

@Component({
  selector: 'app-anuncio-list',
  templateUrl: './anuncio-list.component.html',
  styleUrls: ['./anuncio-list.component.scss']
})
export class AnuncioListComponent implements OnInit {
  cards: Array<Anuncio & { image: string }> = [];
  loading = true;
  feedback = '';
  filtroTermo = '';
  filtroCategoria = '';
  filtroLocalizacao = '';
  filtroPrecoMin: number | null = null;
  filtroPrecoMax: number | null = null;

  constructor(
    private anuncioService: AnuncioService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarAnuncios();
  }

  aplicarFiltros(): void {
    this.carregarAnuncios();
  }

  limparFiltros(): void {
    this.filtroTermo = '';
    this.filtroCategoria = '';
    this.filtroLocalizacao = '';
    this.filtroPrecoMin = null;
    this.filtroPrecoMax = null;
    this.carregarAnuncios();
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
          ? { ...updated, image: updated.imagemUrl || this.getImageByCategory(updated.categoria) }
          : item);
      },
      error: () => {
        this.feedback = 'Não foi possível atualizar os favoritos agora.';
      }
    });
  }

  private carregarAnuncios(): void {
    this.loading = true;
    this.feedback = '';

    this.anuncioService.listarPublicos({
      termo: this.filtroTermo,
      categoria: this.filtroCategoria,
      localizacao: this.filtroLocalizacao,
      precoMin: this.filtroPrecoMin,
      precoMax: this.filtroPrecoMax
    }).subscribe({
      next: (anuncios) => {
        this.cards = anuncios.map((anuncio) => ({
          ...anuncio,
          image: anuncio.imagemUrl || this.getImageByCategory(anuncio.categoria)
        }));
        this.feedback = anuncios.length ? '' : 'Nenhum anúncio encontrado com os filtros informados.';
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
}

