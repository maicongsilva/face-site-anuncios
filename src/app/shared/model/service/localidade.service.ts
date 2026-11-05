import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

@Injectable({ providedIn: 'root' })
export class LocalidadeService {
  private readonly baseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
  private readonly cache = new Map<string, Observable<string[]>>();

  constructor(private http: HttpClient) {}

  listarMunicipios(uf: string): Observable<string[]> {
    let request$ = this.cache.get(uf);
    if (!request$) {
      request$ = this.http.get<Array<{ nome: string }>>(`${this.baseUrl}/${uf}/municipios?orderBy=nome`).pipe(
        map((municipios) => municipios.map((municipio) => municipio.nome)),
        // Não guarda falhas em cache, para permitir nova tentativa.
        tap({ error: () => this.cache.delete(uf) }),
        shareReplay(1)
      );
      this.cache.set(uf, request$);
    }
    return request$;
  }
}

export function formatLocalizacao(cidade: string, uf: string): string {
  return `${cidade}, ${uf}`;
}

export function parseLocalizacao(localizacao: string | undefined | null): { cidade: string; uf: string } | null {
  const match = /^(.+?),\s*([A-Za-z]{2})(?:\b|$)/.exec((localizacao || '').trim());
  if (!match || !ESTADOS_BR.includes(match[2].toUpperCase())) {
    return null;
  }
  return { cidade: match[1].trim(), uf: match[2].toUpperCase() };
}
