# 07 — Roteamento e Navegação

> **Documento:** SDD — Software Design Description  
> **Seção:** 7 — Routing Design  
> **Padrão:** IEEE 1016-2009  

---

## 7.1 Visão Geral

O sistema utiliza o **Angular Router** com estratégia de histórico HTML5 (`PathLocationStrategy`). O roteamento principal é definido no `AppRoutingModule`, com sub-rotas nos feature modules.

---

## 7.2 Tabela de Rotas Completa

| Rota | Componente | Guard | Módulo | Notas |
|------|------------|-------|--------|-------|
| `/` | `HomeComponent` → `AnuncioListComponent` | — | HomeModule (lazy) | Rota raiz |
| `/login` | `LoginComponent` | — | LoginModule | |
| `/register` | `RegisterComponent` | — | AppModule | |
| `/minha-conta` | `ProfileComponent` | `AuthGuard` | AppModule | Requer autenticação |
| `/anuncios/:id` | `AnuncioDetailComponent` | — | AppModule | `:id` = ID do anúncio |
| `/pesquisa` | `PesquisaComponent` | — | PesquisaModule | Aceita `?q=` query param |
| `/mensagens` | `MessagesComponent` | `AuthGuard` | AppModule | Requer autenticação |
| `/chat/:id` | `ChatComponent` | `AuthGuard` | AppModule | `:id` = anuncioId; `?usuario=` = destinatarioId |
| `/admin` | `AdminComponent` | `AuthGuard` | AppModule | Requer autenticação + papel ADMIN |
| `/**` | Redirect para `/` | — | AppModule | Wildcard fallback |

---

## 7.3 Definição de Rotas (AppRoutingModule)

**Arquivo:** `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'minha-conta', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'anuncios/:id', component: AnuncioDetailComponent },
  { path: 'pesquisa', component: PesquisaComponent },
  { path: 'mensagens', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
```

---

## 7.4 Sub-Rotas do HomeModule

**Arquivo:** `src/app/home/home-routing.module.ts`

```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', component: AnuncioListComponent },
      { path: 'novousuario', component: NovoUsuarioComponent }
    ]
  }
];
```

---

## 7.5 Query Parameters

| Rota | Parâmetro | Tipo | Uso |
|------|-----------|------|-----|
| `/` | `q` | `string` | Filtro de busca textual na listagem |
| `/chat/:id` | `usuario` | `number` | ID do outro participante da conversa |

### Leitura de Query Params

```typescript
// Leitura no ngOnInit
constructor(private route: ActivatedRoute) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.searchTerm = params['q'] ?? '';
  });
}
```

### Navegação com Query Params

```typescript
// Navegação programática com query params
this.router.navigate(['/'], { queryParams: { q: this.searchTerm } });

// Link no template
<a [routerLink]="['/']" [queryParams]="{ q: 'computadores' }">...</a>
```

---

## 7.6 Parâmetros de Rota

| Rota | Parâmetro | Uso |
|------|-----------|-----|
| `/anuncios/:id` | `id` | ID do anúncio a exibir |
| `/chat/:id` | `id` | ID do anúncio da conversa |

### Leitura de Parâmetros de Rota

```typescript
ngOnInit(): void {
  const id = Number(this.route.snapshot.params['id']);
  this.anuncioService.getById(id).subscribe(anuncio => {
    this.anuncio = anuncio;
  });
}
```

---

## 7.7 Animações de Rota

O `AppComponent` aplica animações de transição entre rotas usando o trigger `routeAnimations`:

```typescript
// app.component.ts
prepareRoute(outlet: RouterOutlet) {
  return outlet?.activatedRouteData?.['animation'];
}
```

```html
<!-- app.component.html -->
<div [@routeAnimations]="prepareRoute(outlet)">
  <router-outlet #outlet="outlet"></router-outlet>
</div>
```

As animações são definidas como slide horizontal (entrada/saída) via `@angular/animations`.

---

## 7.8 Lazy Loading

O `HomeModule` é carregado de forma lazy (sob demanda):

```
Acesso à rota '/'
      │
      ▼
AppRoutingModule detecta loadChildren
      │
      ▼
Angular carrega home.module.ts (chunk separado)
      │
      ▼
HomeRoutingModule ativa e resolve rotas filhas
```

**Benefício:** O bundle inicial da aplicação não inclui o código do HomeModule, reduzindo o tempo de carregamento inicial (TTFB).

---

## 7.9 Navegação após Ações

| Ação do usuário | Destino |
|-----------------|---------|
| Login bem-sucedido | `/minha-conta` |
| Registro bem-sucedido | `/login` |
| Logout | `/` |
| Clicar em anúncio | `/anuncios/:id` |
| Iniciar chat via anúncio | `/chat/:anuncioId?usuario=:destinatarioId` |
| Clicar em thread de mensagem | `/chat/:anuncioId?usuario=:outroUsuarioId` |
| Clicar em favorito (não autenticado) | `/login` |
| Guard bloqueia rota protegida | `/login` |

---

## 7.10 Adicionando Novas Rotas

### Rota simples (componente existente)
1. Adicionar entrada em `app-routing.module.ts`
2. Aplicar `AuthGuard` se necessário
3. Atualizar tabela 7.2 deste documento

### Nova rota com Feature Module (lazy)
1. Criar o módulo com `ng generate module nome --routing`
2. Registrar rotas internas em `nome-routing.module.ts`
3. Adicionar `loadChildren` no `app-routing.module.ts`
4. Atualizar tabela 7.2 e seção 3 (`03-modules.md`)
