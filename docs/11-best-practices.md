# 11 — Boas Práticas de Desenvolvimento

> **Documento:** SDD — Software Design Description  
> **Seção:** 11 — Development Best Practices  
> **Padrão:** IEEE 1016-2009 | Angular Style Guide | OWASP Top 10  

---

## Índice

1. [Angular & Componentes](#1-angular--componentes)
2. [TypeScript](#2-typescript)
3. [RxJS & Programação Reativa](#3-rxjs--programação-reativa)
4. [Formulários Reativos](#4-formulários-reativos)
5. [Serviços & Injeção de Dependência](#5-serviços--injeção-de-dependência)
6. [Performance](#6-performance)
7. [Tratamento de Erros](#7-tratamento-de-erros)
8. [Testes](#8-testes)
9. [Estilo de Código](#9-estilo-de-código)
10. [Segurança](#10-segurança)
11. [Git & Versionamento](#11-git--versionamento)
12. [O que nunca fazer](#12-o-que-nunca-fazer)

---

## 1. Angular & Componentes

### 1.1 Responsabilidade Única

Cada componente deve fazer **uma única coisa**. Se um componente começa a acumular responsabilidades distintas, divida-o.

```typescript
// ❌ Ruim — componente faz tudo
export class AnuncioComponent {
  // busca anúncios, filtra, pagina, exibe detalhes, gerencia chat...
}

// ✅ Bom — responsabilidades separadas
export class AnuncioListComponent { /* apenas listagem com filtros */ }
export class AnuncioDetailComponent { /* apenas detalhe de um anúncio */ }
export class AnuncioCardComponent { /* apenas renderização do card */ }
```

### 1.2 Smart vs Dumb Components

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Smart (Container)** | Conhece os serviços, gerencia estado, faz chamadas | `AnuncioListComponent`, `ProfileComponent` |
| **Dumb (Presentational)** | Recebe dados via `@Input`, emite eventos via `@Output`, sem dependências de serviço | `AnuncioCardComponent` |

```typescript
// ✅ Dumb component — testável e reutilizável
@Component({ selector: 'app-anuncio-card' })
export class AnuncioCardComponent {
  @Input() anuncio!: Anuncio;
  @Output() favoritoToggle = new EventEmitter<number>();
  @Output() verDetalhes = new EventEmitter<number>();
}
```

### 1.3 Destruição de Subscriptions

Toda subscription criada manualmente **deve ser destruída** no `ngOnDestroy` para evitar memory leaks.

```typescript
// ✅ Padrão recomendado com Subject
export class MeuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.dados$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dados => this.dados = dados);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ Alternativa com async pipe (preferível quando possível)
// No template:
// <div *ngIf="dados$ | async as dados">{{ dados.titulo }}</div>
```

### 1.4 `trackBy` em `*ngFor`

Sempre usar `trackBy` em listas que podem ser atualizadas, para evitar re-renderização desnecessária do DOM.

```typescript
// No componente
trackById(index: number, item: Anuncio): number {
  return item.id;
}
```

```html
<!-- No template -->
<mat-card *ngFor="let anuncio of anuncios; trackBy: trackById">
```

### 1.5 `OnPush` Change Detection

Para componentes dumb ou componentes que recebem dados imutáveis, use `ChangeDetectionStrategy.OnPush` para melhorar performance.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnuncioCardComponent { ... }
```

### 1.6 Lazy Loading de Módulos

Feature modules que não são necessários no carregamento inicial **devem** ser lazy loaded.

```typescript
// ✅ Lazy loading via loadChildren
{ path: 'minha-conta', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) }

// ❌ Evitar import direto no AppModule para módulos pesados
import { ProfileModule } from './profile/profile.module'; // carrega junto com o app
```

---

## 2. TypeScript

### 2.1 Tipagem Estrita

O `tsconfig.json` tem `strict: true`. Nunca contornar com `any` sem justificativa documentada.

```typescript
// ❌ Ruim
let dados: any = this.service.getDados();
function processar(item: any): any { ... }

// ✅ Bom
let dados: Anuncio[] = [];
function processar(item: Anuncio): string { ... }
```

### 2.2 Interfaces vs Classes para Modelos

Use `interface` para modelos de dados vindos da API. Use `class` apenas quando precisar de métodos ou construtores.

```typescript
// ✅ Interface para DTO/modelo de API
interface Anuncio {
  id: number;
  titulo: string;
  preco: number;
}

// ✅ Classe apenas quando necessário
class AnuncioFilter {
  constructor(
    public termo = '',
    public categoria = '',
    public precoMin = 0,
    public precoMax = Infinity
  ) {}

  toQueryParams(): Record<string, string> { ... }
}
```

### 2.3 Tipos Union e Literais

Prefira tipos literais a strings genéricas para valores com domínio fixo.

```typescript
// ❌ Ruim
status: string;
role: string;

// ✅ Bom
status: 'ATIVO' | 'INATIVO' | 'VENDIDO';
role: 'USER' | 'ADMIN';
```

### 2.4 Optional Chaining e Nullish Coalescing

```typescript
// ❌ Ruim — propenso a erros
const nome = usuario && usuario.nome ? usuario.nome : 'Visitante';

// ✅ Bom
const nome = usuario?.nome ?? 'Visitante';
const total = resposta?.totalElements ?? 0;
```

### 2.5 Readonly para Imutabilidade

Use `readonly` em propriedades que não devem ser reatribuídas após inicialização.

```typescript
export class AnuncioService {
  private readonly baseUrl = `${environment.apiUrl}/anuncios`; // ✅
}
```

---

## 3. RxJS & Programação Reativa

### 3.1 Operadores de Composição em vez de Subscriptions Aninhadas

```typescript
// ❌ Ruim — subscription aninhada (callback hell reativo)
this.route.params.subscribe(params => {
  this.anuncioService.getById(params['id']).subscribe(anuncio => {
    this.chatService.getThreads().subscribe(threads => {
      // ...
    });
  });
});

// ✅ Bom — pipeline declarativo
this.route.params.pipe(
  switchMap(params => this.anuncioService.getById(+params['id'])),
  takeUntil(this.destroy$)
).subscribe(anuncio => this.anuncio = anuncio);
```

### 3.2 Escolha do Operador Correto

| Cenário | Operador correto |
|---------|-----------------|
| Cancelar requisição anterior ao mudar o input | `switchMap` |
| Executar requisições em paralelo | `forkJoin` ou `combineLatest` |
| Executar requisições sequencialmente | `concatMap` |
| Requisições independentes (sem cancelamento) | `mergeMap` |
| Tratar erro e continuar o stream | `catchError` |
| Tentar novamente em caso de erro | `retry` / `retryWhen` |
| Remover duplicatas consecutivas | `distinctUntilChanged` |
| Aguardar digitação antes de buscar | `debounceTime` |

```typescript
// ✅ switchMap para busca com input do usuário
this.searchInput.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(termo => this.anuncioService.buscar(termo)),
  takeUntil(this.destroy$)
).subscribe(resultados => this.anuncios = resultados);

// ✅ forkJoin para dados paralelos que precisam de todos os resultados
forkJoin({
  anuncio: this.anuncioService.getById(id),
  relacionados: this.anuncioService.getRelacionados(id)
}).subscribe(({ anuncio, relacionados }) => {
  this.anuncio = anuncio;
  this.relacionados = relacionados;
});
```

### 3.3 BehaviorSubject — Exposição Segura

Nunca exponha um `BehaviorSubject` diretamente. Exponha-o como `Observable` via `asObservable()`.

```typescript
// ❌ Ruim — permite que externos façam .next() no subject
currentUser$ = new BehaviorSubject<AuthUser | null>(null);

// ✅ Bom — encapsulamento correto
private _currentUser$ = new BehaviorSubject<AuthUser | null>(null);
readonly currentUser$ = this._currentUser$.asObservable();

// Apenas o serviço controla o estado
setUser(user: AuthUser): void {
  this._currentUser$.next(user);
}
```

### 3.4 Evitar `setInterval` — Preferir `timer` ou `interval` do RxJS

```typescript
// ❌ Ruim — não é cancelável facilmente
setInterval(() => this.atualizar(), 5000);

// ✅ Bom — integrado ao ciclo de vida com takeUntil
interval(5000).pipe(
  startWith(0),
  switchMap(() => this.chatService.getUnreadCount()),
  takeUntil(this.destroy$)
).subscribe(count => this.unreadCount = count);
```

---

## 4. Formulários Reativos

### 4.1 Sempre usar Reactive Forms (não Template-driven)

```typescript
// ✅ Reactive Form — validação explícita, testável, escalável
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  senha: ['', [Validators.required, Validators.minLength(6)]]
});
```

### 4.2 Getters para Acesso aos Controls

Evite repetir `this.form.get('campo')` no template. Use getters tipados.

```typescript
// ✅ No componente
get email() { return this.form.get('email')!; }
get senha() { return this.form.get('senha')!; }
```

```html
<!-- ✅ No template — limpo e legível -->
<mat-error *ngIf="email.hasError('required')">Email obrigatório</mat-error>
<mat-error *ngIf="email.hasError('email')">Email inválido</mat-error>
```

### 4.3 Desabilitar Botão Corretamente

```html
<!-- ✅ Desabilita enquanto inválido ou carregando -->
<button [disabled]="form.invalid || loading">Enviar</button>
```

### 4.4 Reset após Submit com Sucesso

```typescript
onSubmit(): void {
  if (this.form.invalid) return;
  this.loading = true;
  this.service.criar(this.form.value).subscribe({
    next: () => {
      this.form.reset();          // ✅ Limpa o formulário
      this.loading = false;
    },
    error: (err) => {
      this.errorMessage = getErrorMessage(err, 'generic');
      this.loading = false;
    }
  });
}
```

---

## 5. Serviços & Injeção de Dependência

### 5.1 `providedIn: 'root'` como Padrão

Todos os serviços compartilhados devem ser singletons registrados na raiz.

```typescript
@Injectable({ providedIn: 'root' })
export class AnuncioService { }
```

Exceção: serviços específicos de um feature module podem ser declarados no `providers` do módulo.

### 5.2 URL Base como Constante Privada e Readonly

```typescript
@Injectable({ providedIn: 'root' })
export class MeuService {
  private readonly baseUrl = `${environment.apiUrl}/recurso`; // ✅

  // ❌ Nunca fazer isso:
  // private url = 'http://localhost:8080/recurso';
}
```

### 5.3 Sem Lógica de UI nos Serviços

Serviços não devem conhecer `Router`, `MatSnackBar`, ou qualquer elemento de apresentação.

```typescript
// ❌ Ruim — serviço conhece UI
login(creds: Credentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(...).pipe(
    tap(() => this.router.navigate(['/minha-conta'])),    // ❌
    tap(() => this.snackBar.open('Login bem-sucedido'))   // ❌
  );
}

// ✅ Bom — componente decide o que fazer com o resultado
login(creds: Credentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}/login`, creds).pipe(
    tap(res => this.persistirSessao(res))  // apenas persistência de estado
  );
}
```

### 5.4 Tipagem de Retorno Explícita

Todos os métodos públicos devem ter tipo de retorno declarado.

```typescript
// ❌
getAnuncios(page: number) {
  return this.http.get(this.baseUrl);
}

// ✅
getAnuncios(page: number): Observable<AnuncioPage> {
  return this.http.get<AnuncioPage>(this.baseUrl);
}
```

---

## 6. Performance

### 6.1 Paginação no Servidor

Nunca carregar todos os registros de uma vez. Sempre usar paginação na API.

```typescript
// ✅ Sempre enviar page e size para a API
getAnuncios(page = 0, size = 6): Observable<AnuncioPage> {
  const params = new HttpParams().set('page', page).set('size', size);
  return this.http.get<AnuncioPage>(this.baseUrl, { params });
}
```

### 6.2 Lazy Loading de Imagens

```html
<!-- ✅ Carrega a imagem apenas quando visível -->
<img [src]="anuncio.imagemUrl" [alt]="anuncio.titulo" loading="lazy">
```

### 6.3 Evitar Cálculos Pesados em Getters de Template

Getters acessados no template são chamados a cada ciclo de detecção de mudança.

```typescript
// ❌ Ruim — recalcula a cada change detection
get anunciosFiltrados(): Anuncio[] {
  return this.anuncios.filter(a => a.preco < this.precoMax); // pesado
}

// ✅ Bom — recalcular apenas quando o dado muda
private filtrarAnuncios(): void {
  this.anunciosFiltrados = this.anuncios.filter(a => a.preco < this.precoMax);
}
```

### 6.4 `async pipe` em vez de Subscribe Manual

O `async pipe` gerencia automaticamente a subscription e o `unsubscribe`.

```typescript
// No componente
anuncios$ = this.anuncioService.getAnuncios();
```

```html
<!-- No template -->
<ng-container *ngIf="anuncios$ | async as anuncios">
  <mat-card *ngFor="let a of anuncios; trackBy: trackById">...</mat-card>
</ng-container>
```

### 6.5 Debounce em Inputs de Busca

```typescript
// ✅ Evita chamada de API a cada tecla
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.anuncioService.getAnuncios(0, 6, { q }))
).subscribe(page => this.anuncios = page.content);
```

---

## 7. Tratamento de Erros

### 7.1 Sempre Tratar Erros nas Subscriptions

```typescript
// ❌ Ruim — erro silencioso
this.service.getDados().subscribe(dados => this.dados = dados);

// ✅ Bom — erro tratado e exibido ao usuário
this.service.getDados().subscribe({
  next: (dados) => {
    this.dados = dados;
    this.loading = false;
  },
  error: (err) => {
    this.errorMessage = getErrorMessage(err, 'generic');
    this.loading = false;
  }
});
```

### 7.2 Usar `getErrorMessage()` Centralizado

```typescript
import { getErrorMessage } from 'src/app/shared/utils/error.utils';

// No componente
error: (err) => {
  this.errorMessage = getErrorMessage(err, 'login'); // contexto correto
}
```

### 7.3 Loading State Sempre Presente

Todo componente que faz operações assíncronas deve ter estado de carregamento visível.

```typescript
export class MeuComponent {
  loading = false;

  carregar(): void {
    this.loading = true;
    this.service.getDados().subscribe({
      next: (dados) => { this.dados = dados; this.loading = false; },
      error: (err) => { this.errorMessage = getErrorMessage(err); this.loading = false; }
    });
  }
}
```

```html
<!-- Spinner durante carregamento -->
<div *ngIf="loading" class="loading-overlay">
  <mat-spinner diameter="40"></mat-spinner>
</div>

<!-- Botão desabilitado durante operação -->
<button [disabled]="loading">
  {{ loading ? 'Aguarde...' : 'Salvar' }}
</button>
```

### 7.4 Nunca Suprimir Erros Silenciosamente

```typescript
// ❌ Nunca fazer isso
.subscribe({
  error: () => {} // silencia o erro — o usuário não sabe o que aconteceu
});

// ❌ Também ruim — log sem feedback ao usuário
.subscribe({
  error: (err) => console.error(err)
});
```

---

## 8. Testes

### 8.1 Estrutura de Teste Unitário de Componente

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve redirecionar para /minha-conta ao logar com sucesso', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'abc', user: mockUser }));
    component.loginForm.setValue({ email: 'user@test.com', senha: '123456' });
    component.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/minha-conta']);
  });

  it('deve exibir mensagem de erro ao falhar login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.loginForm.setValue({ email: 'user@test.com', senha: 'errada' });
    component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
  });
});
```

### 8.2 Estrutura de Teste de Serviço

```typescript
describe('AnuncioService', () => {
  let service: AnuncioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnuncioService]
    });
    service = TestBed.inject(AnuncioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify()); // garante que não há requisições pendentes

  it('deve buscar anúncios com paginação', () => {
    const mockPage: AnuncioPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 6, first: true, last: true, empty: true };
    service.getAnuncios(0, 6).subscribe(page => {
      expect(page.content).toEqual([]);
    });
    const req = httpMock.expectOne(r => r.url.includes('/anuncios'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });
});
```

### 8.3 O que Testar

| O que testar | Prioridade |
|-------------|-----------|
| Lógica de negócio em serviços | 🔴 Alta |
| Guards (`canActivate`) | 🔴 Alta |
| Validação de formulários | 🔴 Alta |
| Componentes com lógica complexa | 🟡 Média |
| Componentes puramente visuais (dumb) | 🟢 Baixa |
| Pipes customizados | 🟡 Média |
| Interceptors | 🟡 Média |

### 8.4 Cobertura Mínima Recomendada

| Camada | Cobertura mínima |
|--------|-----------------|
| Serviços | 80% |
| Guards | 100% |
| Componentes com lógica | 70% |
| Utilitários (`error.utils.ts`) | 90% |

---

## 9. Estilo de Código

### 9.1 Ordenação de Imports

```typescript
// 1. Angular core
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// 2. Angular Material / bibliotecas de terceiros
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

// (linha em branco)
// 3. Imports da aplicação (caminho absoluto ou relativo)
import { AuthService } from 'src/app/shared/model/service/auth.service';
import { getErrorMessage } from 'src/app/shared/utils/error.utils';
import { AuthUser } from 'src/app/shared/model/auth.model';
```

### 9.2 Ordenação de Membros da Classe

```typescript
export class MeuComponent {
  // 1. Decoradores de input/output
  @Input() titulo!: string;
  @Output() acao = new EventEmitter<void>();

  // 2. Propriedades públicas
  loading = false;
  errorMessage = '';
  dados: Dado[] = [];

  // 3. Propriedades privadas
  private destroy$ = new Subject<void>();
  private readonly TAMANHO_PAGINA = 6;

  // 4. Constructor
  constructor(private service: MeuService) {}

  // 5. Ciclo de vida (ordem de execução)
  ngOnInit(): void {}
  ngOnChanges(): void {}
  ngOnDestroy(): void {}

  // 6. Getters/Setters
  get isVazio(): boolean { return this.dados.length === 0; }

  // 7. Handlers públicos (chamados pelo template)
  onSubmit(): void {}
  onFiltroChange(valor: string): void {}

  // 8. Métodos privados
  private carregarDados(): void {}
}
```

### 9.3 SCSS — Escopo de Estilos

- Usar variáveis CSS do Material para cores (não hardcodar hex)
- Estilos de componente ficam no `*.component.scss`
- Estilos globais ficam em `src/styles.scss`
- Evitar `!important`
- Classes com nomenclatura BEM quando necessário

```scss
// ✅ Usando variáveis do tema
.card-preco {
  color: var(--mat-sys-primary);
  font-weight: 600;
}

// ✅ BEM para elementos complexos
.anuncio-card {
  &__titulo { font-size: 1.1rem; }
  &__preco { color: green; }
  &--destacado { border: 2px solid var(--mat-sys-primary); }
}
```

---

## 10. Segurança

> Veja o documento completo em [08-security.md](./08-security.md).

### Resumo das regras obrigatórias

| Regra | Motivo |
|-------|--------|
| Nunca usar `bypassSecurityTrustHtml()` sem revisão | Abre vetor de XSS |
| Nunca logar dados sensíveis (senhas, tokens) no console | Exposição de dados |
| Nunca usar `eval()` ou `new Function()` | Execução de código arbitrário |
| URLs de API sempre via `environment.apiUrl` | Evita exposição de endpoints em código |
| Campos de senha sempre com `type="password"` | Impede visualização e autocomplete incorreto |
| Inputs validados antes de enviar à API | Defesa em profundidade |
| `npm audit` antes de cada release | Detecta vulnerabilidades em dependências |

---

## 11. Git & Versionamento

### 11.1 Fluxo de Branches

```
main
 └── feat/nova-funcionalidade    ← sempre derivar da main atualizada
 └── fix/correcao-de-bug
 └── docs/atualizar-secao-x
 └── refactor/extrair-modulo
```

### 11.2 Commits Atômicos

Cada commit deve conter **uma** alteração lógica. Evitar commits que misturam múltiplas funcionalidades.

```bash
# ❌ Ruim — commit que mistura tudo
git commit -m "faz várias coisas"

# ✅ Bom — commits atômicos
git commit -m "feat(chat): adicionar auto-scroll ao receber mensagem"
git commit -m "fix(chat): corrigir contagem de não-lidas ao abrir thread"
git commit -m "docs(sdd): atualizar seção de componentes com ChatComponent"
```

### 11.3 Nunca Commitar

- `node_modules/`
- Arquivos de build (`dist/`)
- Arquivos de ambiente com secrets (`environment.prod.ts` com dados reais)
- `console.log` de debug
- Código comentado sem justificativa

---

## 12. O que Nunca Fazer

Esta seção lista práticas proibidas neste projeto:

| ❌ Proibido | ✅ Alternativa |
|-------------|---------------|
| `any` sem justificativa | Tipo explícito ou `unknown` + type guard |
| Subscription sem `unsubscribe` | `takeUntil(destroy$)` ou `async pipe` |
| Chamada HTTP direta no componente | Sempre via serviço injetado |
| URL hardcoded na aplicação | `environment.apiUrl` |
| `localStorage` acessado fora do `AuthService` | Apenas o `AuthService` gerencia persistência de sessão |
| `console.log` em código de produção | Remover antes do PR |
| `!` non-null assertion sem comentário | Verificar nulabilidade ou adicionar comentário `// seguro porque...` |
| `setInterval` sem `clearInterval` no destroy | RxJS `interval()` + `takeUntil` |
| Subscriptions aninhadas | `switchMap`, `forkJoin`, `combineLatest` |
| `innerHTML` com conteúdo dinâmico do usuário | Interpolação Angular `{{ }}` ou `DomSanitizer` revisado |
| Componentes maiores que ~300 linhas | Dividir em componentes menores |
| Lógica de negócio no template | Mover para método no `.ts` |
| Formulários `ngModel` (template-driven) | `ReactiveFormsModule` com `FormBuilder` |
| Validação apenas no frontend | Sempre validar no backend também |
