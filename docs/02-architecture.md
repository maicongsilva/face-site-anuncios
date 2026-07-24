# 02 — Arquitetura do Sistema

> **Documento:** SDD — Software Design Description  
> **Seção:** 2 — Architectural Design  
> **Padrão:** IEEE 1016-2009  

---

## 2.1 Visão Arquitetural

O sistema segue a arquitetura **Client-Server** com frontend desacoplado do backend:

```
┌─────────────────────────────────────────────┐
│              NAVEGADOR (Cliente)             │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │          Angular SPA (14)           │   │
│   │                                     │   │
│   │  ┌──────────┐   ┌───────────────┐   │   │
│   │  │ Components│   │   Services    │   │   │
│   │  │ (View)   │◄──►│  (Business)  │   │   │
│   │  └──────────┘   └──────┬────────┘   │   │
│   │                        │            │   │
│   │               ┌────────▼────────┐   │   │
│   │               │ HttpClient +    │   │   │
│   │               │ AuthInterceptor │   │   │
│   └───────────────┴────────┬────────┘   │   │
└────────────────────────────┼────────────┘   
                             │ HTTP/HTTPS (REST + JWT)
                ┌────────────▼────────────┐
                │       Backend API        │
                │  (site-anuncios-back)    │
                │  Render.com / localhost  │
                └─────────────────────────┘
```

---

## 2.2 Padrão Arquitetural do Frontend

O Angular impõe o padrão **MVC/MVVM** adaptado:

| Camada | Responsabilidade | Artefatos |
|--------|-----------------|-----------|
| **View** | Template HTML + estilos | `*.component.html`, `*.component.scss` |
| **ViewModel** | Estado local e lógica de apresentação | `*.component.ts` |
| **Model** | Estruturas de dados e contratos | `shared/model/*.model.ts` |
| **Service Layer** | Comunicação com API e estado compartilhado | `shared/model/service/*.service.ts` |

---

## 2.3 Estrutura de Módulos

```
AppModule (raiz)
├── HomeModule           [lazy loaded]
│   ├── AnuncioListComponent
│   ├── HomeComponent
│   └── NovoUsuarioComponent
├── LoginModule          [eager loaded]
│   └── LoginComponent
├── PesquisaModule       [eager loaded]
│   └── PesquisaComponent
└── Componentes declarados diretamente no AppModule:
    ├── AppComponent
    ├── RegisterComponent
    ├── ProfileComponent
    ├── AnuncioDetailComponent
    ├── AdminComponent
    ├── ChatComponent
    └── MessagesComponent
```

> **Nota de melhoria futura:** ProfileComponent, AdminComponent, ChatComponent e MessagesComponent deveriam ser extraídos para feature modules dedicados com lazy loading para melhor performance.

---

## 2.4 Fluxo de Dados

### 2.4.1 Fluxo de Autenticação

```
LoginComponent
    │
    ▼
AuthService.login(credentials)
    │
    ▼
HttpClient POST /api/auth/login
    │
    ▼
AuthResponse { token, user }
    │
    ├── localStorage.setItem('token', ...)
    ├── localStorage.setItem('user', ...)
    ├── currentUser$.next(user)         ← BehaviorSubject
    └── isLoggedIn$.next(true)          ← BehaviorSubject
    │
    ▼
AppComponent.subscribe(isLoggedIn$) → atualiza navbar
```

### 2.4.2 Fluxo de Requisição Autenticada

```
Qualquer Component
    │
    ▼
Service.method() → HttpClient.get/post/...
    │
    ▼
AuthInterceptor (intercepta)
    ├── Lê token do localStorage
    └── Adiciona header: Authorization: Bearer <token>
    │
    ▼
Backend API
    │
    ▼
Response → Observable → Component
```

### 2.4.3 Fluxo de Proteção de Rotas

```
Navegação para rota protegida
    │
    ▼
AuthGuard.canActivate()
    ├── authService.isLoggedIn() → true  → ✅ Permite acesso
    └── authService.isLoggedIn() → false → ❌ Redireciona /login
```

---

## 2.5 Gerenciamento de Estado

O sistema **não utiliza** uma biblioteca de gerenciamento de estado centralizado (NgRx, Akita, etc.). O estado é gerenciado por:

| Mecanismo | Uso |
|-----------|-----|
| `BehaviorSubject` (RxJS) | Estado de autenticação, usuário atual, contador de não-lidas |
| `localStorage` | Persistência do token JWT e dados do usuário entre sessões |
| Estado local do componente | Dados de listagem, formulários, estado de carregamento |
| Query params da URL | Estado de busca (`/pesquisa?q=termo`) |

---

## 2.6 Comunicação com o Backend

| Aspecto | Detalhe |
|---------|---------|
| **Protocolo** | HTTP/HTTPS REST |
| **Autenticação** | Bearer Token (JWT) via header `Authorization` |
| **Formato** | JSON (request e response) |
| **Base URL dev** | `/api` → proxy → `http://localhost:8080` |
| **Base URL prod** | `/api` (mesma origem no deploy Oracle VM) |
| **Paginação** | Padrão Spring Page: `{ content: [], totalElements, totalPages, number }` |

---

## 2.7 Decisões Arquiteturais (ADR)

### ADR-001: Angular Material como biblioteca de UI

- **Decisão:** Usar Angular Material v14 com tema `indigo-pink`
- **Motivação:** Componentes prontos, acessibilidade embutida, integração nativa com Angular
- **Alternativas rejeitadas:** PrimeNG, NGX-Bootstrap
- **Data:** Início do projeto

### ADR-002: Polling para mensagens não lidas

- **Decisão:** Usar `setInterval` a cada 20 segundos para buscar contador de não-lidas
- **Motivação:** Backend não suporta WebSocket; polling é a solução mais simples
- **Trade-off:** Carga extra no servidor; imprecisão de até 20 segundos
- **Alternativa futura:** Migrar para WebSocket ou SSE quando o backend suportar

### ADR-003: JWT armazenado em localStorage

- **Decisão:** Token JWT salvo em `localStorage`
- **Motivação:** Simplicidade de implementação, persistência entre abas
- **Risco:** Vulnerabilidade a ataques XSS; mitigado pela política de CSP e sanitização do Angular
- **Alternativa mais segura:** HttpOnly Cookie (requer suporte no backend)

### ADR-004: Sem gerenciamento de estado global

- **Decisão:** Usar `BehaviorSubject` nos serviços em vez de NgRx
- **Motivação:** Complexidade do projeto não justifica overhead do NgRx
- **Limiar de revisão:** Quando houver mais de 5 serviços compartilhando estado entre si
