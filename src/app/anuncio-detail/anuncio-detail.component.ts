import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../shared/model/anuncio.model';
import { AnuncioService } from '../shared/model/service/anuncio.service';
import { AuthService } from '../shared/model/service/auth.service';

@Component({
  selector: 'app-anuncio-detail',
  templateUrl: './anuncio-detail.component.html',
  styleUrls: ['./anuncio-detail.component.scss']
})
export class AnuncioDetailComponent implements OnInit {
  anuncio: Anuncio | null = null;
  relacionados: Anuncio[] = [];
  loading = true;
  shareFeedback = '';

  constructor(
    private route: ActivatedRoute,
    private anuncioService: AnuncioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.loading = false;
      return;
    }

    this.anuncioService.buscarPorId(id).subscribe({
      next: (anuncio) => {
        this.anuncio = anuncio;
        this.loading = false;

        if (anuncio.id) {
          this.carregarRelacionados(anuncio.id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleFavorito(): void {
    if (!this.anuncio?.id) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.anuncioService.toggleFavorito(this.anuncio.id).subscribe({
      next: (anuncio) => this.anuncio = anuncio
    });
  }

  get whatsappLink(): string | null {
    const telefone = this.anuncio?.anuncianteTelefone?.replace(/\D/g, '');
    if (!telefone) {
      return null;
    }

    const texto = encodeURIComponent(`Olá! Tenho interesse no anúncio ${this.anuncio?.titulo}.`);
    return `https://wa.me/55${telefone}?text=${texto}`;
  }

  get emailLink(): string | null {
    const email = this.anuncio?.anuncianteEmail;
    if (!email) {
      return null;
    }

    const assunto = encodeURIComponent(`Interesse no anúncio ${this.anuncio?.titulo}`);
    return `mailto:${email}?subject=${assunto}`;
  }

  compartilharAnuncio(): void {
    if (!this.anuncio) {
      return;
    }

    const url = this.getCurrentUrl();

    if (navigator.share) {
      navigator.share({
        title: this.anuncio.titulo,
        text: `Olha esse anúncio: ${this.anuncio.titulo}`,
        url
      }).then(() => {
        this.shareFeedback = 'Anúncio compartilhado com sucesso.';
      }).catch(() => {
        this.copyLink();
      });
      return;
    }

    this.copyLink();
  }

  copyLink(): void {
    const url = this.getCurrentUrl();

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          this.shareFeedback = 'Link copiado para a área de transferência.';
        })
        .catch(() => {
          this.shareFeedback = 'Não foi possível copiar o link agora.';
        });
      return;
    }

    this.shareFeedback = 'Copie o link direto da barra do navegador.';
  }

  private carregarRelacionados(id: number): void {
    this.anuncioService.buscarRelacionados(id, 3).subscribe({
      next: (anuncios) => {
        this.relacionados = anuncios;
      }
    });
  }

  private getCurrentUrl(): string {
    return window.location.href;
  }
}
