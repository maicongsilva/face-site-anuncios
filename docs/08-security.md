# 08 — Design de Segurança

> **Documento:** SDD — Software Design Description  
> **Seção:** 8 — Security Design  
> **Padrão:** IEEE 1016-2009 | OWASP Top 10  

---

## 8.1 Modelo de Segurança

A aplicação implementa segurança em duas camadas:

```
┌─────────────────────────────────────┐
│           Frontend (Angular)         │
│                                     │
│  ┌─────────┐    ┌───────────────┐   │
│  │AuthGuard│    │AuthInterceptor│   │
│  │(routing)│    │(HTTP headers) │   │
│  └────┬────┘    └───────┬───────┘   │
│       │                 │           │
└───────┼─────────────────┼───────────┘
        │                 │
        ▼                 ▼
   Bloqueia acesso    Adiciona JWT
   a rotas            a requisições
   protegidas         autenticadas
        │                 │
        └────────┬─────────┘
                 ▼
         ┌───────────────┐
         │  Backend API  │
         │ (Autorização  │
         │  real via JWT)│
         └───────────────┘
```

> ⚠️ **Importante:** O frontend é responsável pela **experiência** de segurança (UX). A **segurança real** é aplicada e validada pelo backend. Nunca confiar exclusivamente no frontend para controle de acesso.

---

## 8.2 Autenticação — JWT (JSON Web Token)

### Fluxo de Autenticação

```
1. Usuário submete credenciais (email + senha)
2. POST /api/auth/login → Backend valida e retorna { token, user }
3. Frontend armazena token no localStorage
4. Todas as requisições subsequentes incluem: Authorization: Bearer <token>
5. Backend valida o token em cada requisição protegida
6. Ao fazer logout: localStorage limpo, estado resetado
```

### Estrutura do Token JWT

O token é opaco para o frontend (não é decodificado diretamente). O backend é responsável por:
- Assinar o token com chave secreta
- Definir expiração (`exp`)
- Incluir claims de papel/role

### Persistência do Token

| Aspecto | Detalhe |
|---------|---------|
| **Armazenamento** | `localStorage` |
| **Chave** | `'token'` |
| **Dados do usuário** | `localStorage['user']` (JSON serializado) |
| **Expiração** | Controlada pelo backend; sem refresh automático no frontend |
| **Limpeza** | `AuthService.logout()` remove ambas as chaves |

### Risco: XSS e localStorage

O uso de `localStorage` expõe o token a ataques XSS. Mitigações aplicadas:

| Mitigação | Implementação |
|-----------|---------------|
| **Sanitização automática** | Angular sanitiza bindings `{{ }}` e `[innerHTML]` por padrão |
| **Sem uso de `bypassSecurityTrust*`** | Não utilizado no projeto |
| **Sem `innerHTML` dinâmico** | Templates usam binding seguro |

> **Melhoria futura (ADR-003):** Migrar para `HttpOnly Cookie` eliminaria o vetor de XSS para roubo de token.

---

## 8.3 AuthGuard

**Arquivo:** `src/app/shared/guards/auth.guard.ts`

### Implementação

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Rotas Protegidas

| Rota | Motivo |
|------|--------|
| `/minha-conta` | Dados pessoais do usuário |
| `/mensagens` | Conversas privadas |
| `/chat/:id` | Mensagens individuais |
| `/admin` | Painel administrativo |

### Limitações

- O guard verifica apenas a **presença** do token no localStorage (via `isLoggedIn()`)
- **Não valida** se o token está expirado ou é válido criptograficamente
- Para rotas admin, a verificação de papel `ADMIN` é feita **dentro do componente** (`AdminComponent.ngOnInit`), não no guard

> **Melhoria recomendada:** Criar um `AdminGuard` dedicado que verifique `currentUser.role === 'ADMIN'` antes de ativar a rota.

---

## 8.4 AuthInterceptor

**Arquivo:** `src/app/shared/interceptors/auth.interceptor.ts`

### Responsabilidades

1. **Injetar token JWT** em todas as requisições HTTP de saída
2. **Normalizar erros de proxy/rede** em formato `HttpErrorResponse` padronizado

### Implementação do Header

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next.handle(req).pipe(
    catchError(error => {
      // Normaliza erros de proxy (0, CORS, etc.)
      return throwError(() => this.normalizeError(error));
    })
  );
}
```

### Normalização de Erros

| Erro recebido | Normalizado para |
|---------------|-----------------|
| Status 0 (offline/CORS) | `HttpErrorResponse { status: 0, message: 'Sem conexão' }` |
| Erro de rede sem status | `HttpErrorResponse { status: 503 }` |
| Outros erros HTTP | Passados sem alteração |

---

## 8.5 Controle de Acesso por Papel (Role-Based)

| Recurso | Visitante | Usuário | Admin |
|---------|-----------|---------|-------|
| Ver listagem de anúncios | ✅ | ✅ | ✅ |
| Ver detalhe de anúncio | ✅ | ✅ | ✅ |
| Buscar anúncios | ✅ | ✅ | ✅ |
| Favoritar anúncio | ❌ (→ login) | ✅ | ✅ |
| Criar/editar anúncio | ❌ | ✅ | ✅ |
| Enviar mensagem | ❌ | ✅ | ✅ |
| Ver mensagens | ❌ | ✅ | ✅ |
| Painel admin | ❌ | ❌ | ✅ |

### Implementação de Verificação de Papel no Componente

```typescript
// AdminComponent - verificação dentro do ngOnInit
ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    this.router.navigate(['/']);
    return;
  }
  this.loadDashboard();
}
```

---

## 8.6 OWASP Top 10 — Análise de Risco

| Risco OWASP | Status | Mitigação |
|-------------|--------|-----------|
| A01: Broken Access Control | ⚠️ Parcial | Guard presente; verificação de role no componente (não no guard) |
| A02: Cryptographic Failures | ✅ N/A | JWT gerenciado pelo backend; frontend não criptografa dados |
| A03: Injection | ✅ Mitigado | Angular sanitiza templates; sem SQL/comando no frontend |
| A04: Insecure Design | ⚠️ Parcial | Sem refresh token; expiração não verificada no frontend |
| A05: Security Misconfiguration | ✅ Mitigado | CORS gerenciado pelo backend; proxy apenas em dev |
| A06: Vulnerable Components | 🔍 Monitorar | Executar `npm audit` regularmente |
| A07: Auth Failures | ⚠️ Parcial | Token em localStorage (XSS risk); sem renovação automática |
| A08: Data Integrity Failures | ✅ N/A | Sem funcionalidade de auto-update de dependências |
| A09: Security Logging | ⚠️ N/A | Sem logging de segurança no frontend |
| A10: SSRF | ✅ N/A | Frontend não realiza requisições server-side |

---

## 8.7 Boas Práticas Adotadas

- ✅ Angular sanitiza automaticamente interpolações (`{{ }}`) e bindings de propriedade
- ✅ Formulários reativos com validadores (`Validators.email`, `Validators.minLength`)
- ✅ Sem exposição de dados sensíveis em URLs (senhas, documentos)
- ✅ Separação de ambientes (`environment.ts` vs `environment.prod.ts`)
- ✅ Proxy de desenvolvimento isolado (não expõe backend diretamente)

## 8.8 Checklist de Segurança para Novas Features

Antes de mergear qualquer PR com funcionalidade nova:

- [ ] Dados sensíveis não são logados no console
- [ ] Campos de senha usam `type="password"`
- [ ] Nenhuma URL de API hardcoded (sempre via `environment.apiUrl`)
- [ ] Rotas que exigem autenticação têm `AuthGuard`
- [ ] Rotas de admin verificam `role === 'ADMIN'`
- [ ] `npm audit` executado e sem vulnerabilidades críticas
- [ ] Sem uso de `bypassSecurityTrustHtml/Url/Script`
- [ ] Inputs de texto não são passados diretamente para `innerHTML`
