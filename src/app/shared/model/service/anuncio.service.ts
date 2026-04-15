import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Anuncio } from '../anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private readonly apiUrl = `${environment.apiUrl}/anuncios`;

  constructor(private http: HttpClient) {}

  listarPublicos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.apiUrl);
  }

  listarMeus(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/meus`);
  }

  listarFavoritos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/favoritos/meus`);
  }

  buscarPorId(id: number): Observable<Anuncio> {
    return this.http.get<Anuncio>(`${this.apiUrl}/${id}`);
  }

  criar(payload: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.apiUrl, payload);
  }

  toggleFavorito(id: number): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${this.apiUrl}/${id}/favorito`, {});
  }

  atualizar(id: number, payload: Partial<Anuncio>): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${this.apiUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
