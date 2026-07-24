# 05 — Design dos Serviços

> **Documento:** SDD — Software Design Description  
> **Seção:** 5 — Service Layer Design  
> **Padrão:** IEEE 1016-2009  

---

## 5.1 Visão Geral da Camada de Serviços

Todos os serviços residem em `src/app/shared/model/service/` e são registrados como singletons (`providedIn: 'root'`), salvo onde indicado.

```
shared/model/service/
├── auth.service.ts       ← Autenticação e estado do usuário
├── anuncio.service.ts    ← CRUD de anúncios
├── chat.service.ts       ← Mensagens e threads
├── admin.service.ts      ← Painel administrativo
├── usuario.service.ts    ← Registro legado (parcialmente substituído por AuthService)
└── item.service.ts       ← DESCONTINUADO (não utilizado)
```

---

## 5.2 AuthService

**Arquivo:** `src/app/shared/model/service/auth.service.ts`  
**Scope:** `providedIn: 'root'`

### Responsabilidade
Centraliza toda a lógica de autenticação: login, registro, persistência de token e estado reativo do usuário atual.

### Estado Reativo (BehaviorSubjects)

| Subject | Tipo | Valor inicial | Descrição |
|---------|------|---------------|-----------|
| `currentUser$` | `BehaviorSubject<AuthUser \| null>` | Valor do localStorage | Usuário atualmente autenticado |
| `isLoggedIn$` | `BehaviorSubject<boolean>` | `!!token` | Flag de autenticação |

### Interface Pública

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `login(credentials)` | `Observable<AuthResponse>` | POST `/auth/login`; persiste token e usuário |
| `register(payload)` | `Observable<AuthUser>` | POST `/auth/register` |
| `logout()` | `void` | Remove token/usuário do localStorage; reseta subjects |
| `isLoggedIn()` | `boolean` | Retorna valor atual de `isLoggedIn$` |
| `getCurrentUser()` | `AuthUser \| null` | Retorna valor atual de `currentUser$` |
| `getToken()` | `string \| null` | Lê token do localStorage |
| `updateProfile(payload)` | `Observable<AuthUser>` | PUT `/usuarios/me`; atualiza subject e localStorage |

### Persistência
```
localStorage keys:
  'token'  → string (JWT)
  'user'   → string (JSON de AuthUser)
```

### Fluxo de Inicialização
```
constructor()
  └── Lê 'user' e 'token' do localStorage
      ├── Se existirem → inicializa currentUser$ e isLoggedIn$ com valores salvos
      └── Se não existirem → inicializa com null/false
```

---

## 5.3 AnuncioService

**Arquivo:** `src/app/shared/model/service/anuncio.service.ts`  
**Scope:** `providedIn: 'root'`

### Responsabilidade
Toda a comunicação com endpoints de anúncios: listagem, detalhes, criação, edição, remoção, favoritos e upload de imagens.

### Interface Pública

| Método | Parâmetros | Retorno | Endpoint |
|--------|-----------|---------|----------|
| `getAnuncios(page, size, filters?)` | Filtros opcionais | `Observable<AnuncioPage>` | `GET /anuncios` |
| `getById(id)` | `id: number` | `Observable<Anuncio>` | `GET /anuncios/:id` |
| `getRelacionados(id)` | `id: number` | `Observable<Anuncio[]>` | `GET /anuncios/:id/relacionados` |
| `getMeusAnuncios()` | — | `Observable<Anuncio[]>` | `GET /anuncios/meus` |
| `create(payload)` | `Partial<Anuncio>` | `Observable<Anuncio>` | `POST /anuncios` 🔒 |
| `update(id, payload)` | `id`, `Partial<Anuncio>` | `Observable<Anuncio>` | `PUT /anuncios/:id` 🔒 |
| `delete(id)` | `id: number` | `Observable<void>` | `DELETE /anuncios/:id` 🔒 |
| `toggleFavorito(id)` | `id: number` | `Observable<Anuncio>` | `POST /anuncios/:id/favorito` 🔒 |
| `getFavoritos()` | — | `Observable<Anuncio[]>` | `GET /anuncios/favoritos` 🔒 |
| `uploadImagem(id, file)` | `id`, `File` | `Observable<string>` | `POST /anuncios/:id/imagem` 🔒 |

> 🔒 = Requer token JWT (adicionado pelo `AuthInterceptor`)

### Parâmetros de Filtro (getAnuncios)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | `string` | Busca textual |
| `categoria` | `string` | Filtro de categoria |
| `localizacao` | `string` | Filtro de localização |
| `precoMin` | `number` | Preço mínimo |
| `precoMax` | `number` | Preço máximo |
| `sort` | `string` | Campo de ordenação |
| `direction` | `'asc' \| 'desc'` | Direção da ordenação |

---

## 5.4 ChatService

**Arquivo:** `src/app/shared/model/service/chat.service.ts`  
**Scope:** `providedIn: 'root'`

### Responsabilidade
Gerencia envio, recebimento e listagem de mensagens e threads de conversa.

### Interface Pública

| Método | Parâmetros | Retorno | Endpoint |
|--------|-----------|---------|----------|
| `getThreads()` | — | `Observable<ChatThread[]>` | `GET /chat/threads` 🔒 |
| `getMessages(anuncioId, usuarioId)` | `number, number` | `Observable<ChatMessage[]>` | `GET /chat/:anuncioId/usuario/:usuarioId` 🔒 |
| `sendMessage(payload)` | `SendMessagePayload` | `Observable<ChatMessage>` | `POST /chat` 🔒 |
| `getUnreadCount()` | — | `Observable<number>` | `GET /chat/nao-lidas` 🔒 |
| `markAsRead(anuncioId, usuarioId)` | `number, number` | `Observable<void>` | `PUT /chat/:anuncioId/usuario/:usuarioId/lidas` 🔒 |

### Modelo de Payload de Envio
```typescript
interface SendMessagePayload {
  anuncioId: number;
  destinatarioId: number;
  conteudo: string;
}
```

---

## 5.5 AdminService

**Arquivo:** `src/app/shared/model/service/admin.service.ts`  
**Scope:** `providedIn: 'root'`

### Responsabilidade
Busca dados para o painel de administração. Acesso restrito ao papel `ADMIN`.

### Interface Pública

| Método | Retorno | Endpoint |
|--------|---------|----------|
| `getDashboard()` | `Observable<AdminDashboard>` | `GET /admin/dashboard` 🔒 |

---

## 5.6 UsuarioService

**Arquivo:** `src/app/shared/model/service/usuario.service.ts`  
**Scope:** `providedIn: 'root'`  
**Status:** ⚠️ **Legado** — funcionalidade duplicada pelo `AuthService`

### Descrição
Originalmente responsável pelo registro de usuários. Atualmente, o `AuthService` cobre as mesmas funcionalidades. Este serviço mantém um endpoint de busca por documento que pode ser útil em casos específicos.

### Ações recomendadas
- [ ] Avaliar remoção ou consolidação com `AuthService`
- [ ] Documentar se `buscarPorDocumento()` ainda é necessário

---

## 5.7 ItemService

**Arquivo:** `src/app/shared/model/service/item.service.ts`  
**Status:** ❌ **Descontinuado** — URL hardcoded (`http://localhost:8080/itens`), não utilizado em nenhum componente

### Ação recomendada
- [ ] Remover o arquivo em próxima release de cleanup

---

## 5.8 Padrões de Implementação de Serviços

### Template de Novo Serviço

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MeuService {
  private readonly baseUrl = `${environment.apiUrl}/meu-recurso`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<ResponsePageable<MeuModelo>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ResponsePageable<MeuModelo>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<MeuModelo> {
    return this.http.get<MeuModelo>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<MeuModelo>): Observable<MeuModelo> {
    return this.http.post<MeuModelo>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<MeuModelo>): Observable<MeuModelo> {
    return this.http.put<MeuModelo>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### Regras de Serviços

1. **URL base via `environment.apiUrl`** — nunca hardcodar URLs
2. **Tipagem forte** — métodos sempre tipados com o modelo retornado
3. **Sem estado mutável** — serviços são stateless por padrão; use BehaviorSubject apenas para estado global necessário
4. **Sem tratamento de erro** — erros propagam para o componente (tratado com `getErrorMessage()`)
5. **HttpParams para query strings** — nunca concatenar strings manualmente
