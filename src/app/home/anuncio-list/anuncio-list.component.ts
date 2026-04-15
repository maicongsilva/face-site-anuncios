import { Component, OnInit } from '@angular/core';
import { Anuncio } from 'src/app/shared/model/anuncio.model';
import { AnuncioService } from 'src/app/shared/model/service/anuncio.service';

@Component({
  selector: 'app-anuncio-list',
  templateUrl: './anuncio-list.component.html',
  styleUrls: ['./anuncio-list.component.scss']
})
export class AnuncioListComponent implements OnInit {
  cards: Array<Anuncio & { image: string }> = [];
  loading = true;

  constructor(private anuncioService: AnuncioService) { }

  ngOnInit(): void {
    this.anuncioService.listarPublicos().subscribe({
      next: (anuncios) => {
        this.cards = anuncios.map((anuncio) => ({
          ...anuncio,
          image: anuncio.imagemUrl || this.getImageByCategory(anuncio.categoria)
        }));
        this.loading = false;
      },
      error: () => {
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

