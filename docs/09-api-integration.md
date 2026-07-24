# 09 — Integração com a API

> **Documento:** SDD — Software Design Description  
> **Seção:** 9 — API Integration Design  
> **Padrão:** IEEE 1016-2009  

---

## 9.1 Configuração da API

### URLs Base

| Ambiente | URL | Configuração |
|----------|-----|-------------|
| **Desenvolvimento** | `/api` | `src/environments/environment.ts` → proxy |
| **Produção** | `/api` (mesma origem no deploy Oracle VM) | `src/environments/environment.prod.ts` |

### Proxy de Desenvolvimento

**Arquivo:** `proxy.conf.js`

```javascript
module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    logLevel: 'debug'
  }
};
```

O Angular CLI usa este proxy ao executar `npm start` (`ng serve --proxy-config proxy.conf.js`), redirecionando chamadas de `/api/*` para o backend local.

---

## 9.2 Endpoints por Domínio

### Autenticação (`/auth`)

| Método | Endpoint | Autenticação | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/auth/login` | ❌ | `{ email, senha }` | `AuthResponse` |
| `POST` | `/api/auth/register` | ❌ | `{ nome, email, senha, documento?, telefone? }` | `AuthUser` |

### Anúncios (`/anuncios`)

| Método | Endpoint | Autenticação | Params / Body | Response |
|--------|----------|-------------|---------------|----------|
| `GET` | `/api/anuncios` | ❌ | `?page, size, q, categoria, localizacao, precoMin, precoMax, sort, direction` | `AnuncioPage` |
| `GET` | `/api/anuncios/:id` | ❌ | — | `Anuncio` |
| `GET` | `/api/anuncios/:id/relacionados` | ❌ | — | `Anuncio[]` |
| `GET` | `/api/anuncios/meus` | ✅ | — | `Anuncio[]` |
| `POST` | `/api/anuncios` | ✅ | `Partial<Anuncio>` | `Anuncio` |
| `PUT` | `/api/anuncios/:id` | ✅ | `Partial<Anuncio>` | `Anuncio` |
| `DELETE` | `/api/anuncios/:id` | ✅ | — | `204 No Content` |
| `POST` | `/api/anuncios/:id/favorito` | ✅ | — | `Anuncio` (atualizado) |
| `GET` | `/api/anuncios/favoritos` | ✅ | — | `Anuncio[]` |
| `POST` | `/api/anuncios/:id/imagem` | ✅ | `FormData` (campo `file`) | `{ url: string }` |

### Chat (`/chat`)

| Método | Endpoint | Autenticação | Params / Body | Response |
|--------|----------|-------------|---------------|----------|
| `GET` | `/api/chat/threads` | ✅ | — | `ChatThread[]` |
| `GET` | `/api/chat/:anuncioId/usuario/:usuarioId` | ✅ | — | `ChatMessage[]` |
| `POST` | `/api/chat` | ✅ | `{ anuncioId, destinatarioId, conteudo }` | `ChatMessage` |
| `GET` | `/api/chat/nao-lidas` | ✅ | — | `number` |
| `PUT` | `/api/chat/:anuncioId/usuario/:usuarioId/lidas` | ✅ | — | `204 No Content` |

### Usuários (`/usuarios`)

| Método | Endpoint | Autenticação | Body | Response |
|--------|----------|-------------|------|----------|
| `PUT` | `/api/usuarios/me` | ✅ | `UpdateProfilePayload` | `AuthUser` |

### Admin (`/admin`)

| Método | Endpoint | Autenticação | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/admin/dashboard` | ✅ (ADMIN) | `AdminDashboard` |

---

## 9.3 Formato de Request/Response

### Headers Padrão

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>   ← Adicionado automaticamente pelo AuthInterceptor
```

### Paginação — Padrão Spring Page

**Request (query params):**
```
?page=0&size=6&sort=dataCriacao&direction=desc
```

**Response:**
```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 7,
  "number": 0,
  "size": 6,
  "first": true,
  "last": false,
  "empty": false
}
```

### Upload de Imagem

```typescript
// Construção do FormData
const formData = new FormData();
formData.append('file', file, file.name);

// Requisição (sem Content-Type — deixar o browser definir multipart boundary)
this.http.post(`${this.baseUrl}/${id}/imagem`, formData)
```

---

## 9.4 Tratamento de Erros HTTP

### Utilitário Centralizado

**Arquivo:** `src/app/shared/utils/error.utils.ts`

```typescript
getErrorMessage(error: HttpErrorResponse, context: 'login' | 'register' | 'generic'): string
```

### Mapeamento de Códigos de Erro

| Status HTTP | Contexto | Mensagem exibida |
|-------------|---------|-----------------|
| `400` | login | "Dados inválidos. Verifique email e senha." |
| `400` | register | "Dados inválidos. Verifique as informações." |
| `401` | login | "Email ou senha incorretos." |
| `401` | generic | "Sessão expirada. Faça login novamente." |
| `403` | * | "Você não tem permissão para esta ação." |
| `404` | * | "Recurso não encontrado." |
| `409` | register | "Este email já está cadastrado." |
| `422` | * | "Dados inválidos. Verifique as informações." |
| `5xx` | * | "Erro no servidor. Tente novamente mais tarde." |
| `0` | * | "Sem conexão com o servidor. Verifique sua internet." |

### Uso nos Componentes

```typescript
this.authService.login(credentials).subscribe({
  next: () => this.router.navigate(['/minha-conta']),
  error: (err) => {
    this.errorMessage = getErrorMessage(err, 'login');
  }
});
```

---

## 9.5 Configuração de Ambiente

### environment.ts (Desenvolvimento)

```typescript
export const environment = {
  production: false,
  apiUrl: '/api'  // Proxy intercepta e redireciona para localhost:8080
};
```

### environment.prod.ts (Produção)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api'  // mesmo host do frontend; nginx encaminha para a API
};
```

### Uso nos Serviços

```typescript
// Sempre usar a constante de ambiente — nunca hardcodar
private readonly baseUrl = `${environment.apiUrl}/anuncios`;
```

---

## 9.6 Estratégia de Retry e Timeout

Atualmente **não há** lógica de retry ou timeout configurada no frontend além dos defaults do `HttpClient`.

**Comportamento atual:**
- Timeout: padrão do navegador (~30s para a maioria)
- Retry: nenhum — erro é propagado imediatamente ao componente

**Implementação futura recomendada:**

```typescript
// Em serviços críticos, adicionar operador retry
return this.http.get<T>(url).pipe(
  retry({ count: 2, delay: 1000 }),
  timeout(10000)
);
```

---

## 9.7 Checklist para Novos Endpoints

Ao integrar um novo endpoint:

- [ ] URL usa `environment.apiUrl` como base
- [ ] Método HTTP correto (GET read-only, POST criação, PUT atualização completa, PATCH parcial, DELETE remoção)
- [ ] Tipagem de request e response definida em `06-data-models.md`
- [ ] Endpoint adicionado na tabela da seção 9.2 deste documento
- [ ] Tratamento de erro via `getErrorMessage()` no componente consumidor
- [ ] Endpoint autenticado usa `AuthInterceptor` (automático)
- [ ] Testado com `npm audit` para validar dependências do projeto
