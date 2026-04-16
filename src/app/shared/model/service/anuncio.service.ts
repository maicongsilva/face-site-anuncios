import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Anuncio, AnuncioPage } from '../anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private readonly apiUrl = `${environment.apiUrl}/anuncios`;

  constructor(private http: HttpClient) {}

  listarPublicos(
    filters?: {
      termo?: string;
      categoria?: string;
      localizacao?: string;
      precoMin?: number | null;
      precoMax?: number | null;
    },
    page = 0,
    size = 9,
    sortBy = 'dataCriacao',
    direction = 'desc'
  ): Observable<AnuncioPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (filters?.termo?.trim()) {
      params = params.set('termo', filters.termo.trim());
    }

    if (filters?.categoria?.trim()) {
      params = params.set('categoria', filters.categoria.trim());
    }

    if (filters?.localizacao?.trim()) {
      params = params.set('localizacao', filters.localizacao.trim());
    }

    if (filters?.precoMin !== null && filters?.precoMin !== undefined) {
      params = params.set('precoMin', String(filters.precoMin));
    }

    if (filters?.precoMax !== null && filters?.precoMax !== undefined) {
      params = params.set('precoMax', String(filters.precoMax));
    }

    return this.http.get<AnuncioPage>(this.apiUrl, { params }).pipe(
      map((pageResponse) => ({
        ...pageResponse,
        content: pageResponse.content.map((anuncio) => this.normalizeAnuncio(anuncio))
      }))
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

  buscarRelacionados(id: number, limit = 3): Observable<Anuncio[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<Anuncio[]>(`${this.apiUrl}/${id}/relacionados`, { params }).pipe(
      map((anuncios) => anuncios.map((anuncio) => this.normalizeAnuncio(anuncio)))
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
