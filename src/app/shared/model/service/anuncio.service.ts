import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Anuncio } from '../anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private readonly apiUrl = `${environment.apiUrl}/anuncios`;

  constructor(private http: HttpClient) {}

  listarPublicos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.apiUrl).pipe(
      map((anuncios) => anuncios.map((anuncio) => this.normalizeAnuncio(anuncio)))
    );
  }

  listarMeus(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/meus`).pipe(
      map((anuncios) => anuncios.map((anuncio) => this.normalizeAnuncio(anuncio)))
    );
  }

  listarFavoritos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/favoritos/meus`).pipe(
      map((anuncios) => anuncios.map((anuncio) => this.normalizeAnuncio(anuncio)))
    );
  }

  buscarPorId(id: number): Observable<Anuncio> {
    return this.http.get<Anuncio>(`${this.apiUrl}/${id}`).pipe(
      map((anuncio) => this.normalizeAnuncio(anuncio))
    );
  }

  criar(payload: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.apiUrl, payload).pipe(
      map((anuncio) => this.normalizeAnuncio(anuncio))
    );
  }

  uploadImagem(id: number, file: File): Observable<Anuncio> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Anuncio>(`${this.apiUrl}/${id}/imagem`, formData).pipe(
      map((anuncio) => this.normalizeAnuncio(anuncio))
    );
  }

  toggleFavorito(id: number): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${this.apiUrl}/${id}/favorito`, {}).pipe(
      map((anuncio) => this.normalizeAnuncio(anuncio))
    );
  }

  atualizar(id: number, payload: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${this.apiUrl}/${id}`, payload).pipe(
      map((anuncio) => this.normalizeAnuncio(anuncio))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeAnuncio(anuncio: Anuncio): Anuncio {
    return {
      ...anuncio,
      imagemUrl: this.resolveImageUrl(anuncio.imagemUrl)
    };
  }

  private resolveImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads')) {
      return `${this.getBackendOrigin()}${imageUrl}`;
    }

    return imageUrl;
  }

  private getBackendOrigin(): string {
    if (environment.apiUrl.startsWith('http')) {
      return new URL(environment.apiUrl).origin;
    }

    return 'http://localhost:8080';
  }
}
