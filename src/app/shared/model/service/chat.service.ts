import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../chat.model';
import { ChatThread } from '../chat-thread.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private readonly unreadRefreshSubject = new Subject<void>();
  readonly unreadRefresh$ = this.unreadRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  listarMensagens(anuncioId: number, participanteId?: number): Observable<ChatMessage[]> {
    const params = participanteId ? new HttpParams().set('participanteId', participanteId) : undefined;
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/anuncio/${anuncioId}/mensagens`, { params });
  }

  enviarMensagem(anuncioId: number, conteudo: string, participanteId?: number): Observable<ChatMessage> {
    const params = participanteId ? new HttpParams().set('participanteId', participanteId) : undefined;
    return this.http.post<ChatMessage>(`${this.apiUrl}/anuncio/${anuncioId}/mensagens`, { conteudo }, { params });
  }

  listarConversas(): Observable<ChatThread[]> {
    return this.http.get<ChatThread[]>(`${this.apiUrl}/conversas`);
  }

  contarNaoLidas(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/nao-lidas`);
  }

  notifyUnreadRefresh(): void {
    this.unreadRefreshSubject.next();
  }
}
