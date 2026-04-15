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
  loading = true;

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
}
