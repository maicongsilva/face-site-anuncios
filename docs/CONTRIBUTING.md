# Guia de Contribuição e Ciclo de Desenvolvimento

> Este documento define o **ciclo completo de desenvolvimento** para o projeto Face Site Anúncios.  
> Todo contribuidor deve ler e seguir este guia.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Ambiente](#2-configuração-do-ambiente)
3. [Ciclo de Desenvolvimento](#3-ciclo-de-desenvolvimento)
4. [Padrões de Código](#4-padrões-de-código)
5. [Padrões de Commit](#5-padrões-de-commit)
6. [Processo de Pull Request](#6-processo-de-pull-request)
7. [Atualizando a Documentação](#7-atualizando-a-documentação)
8. [Checklist de Qualidade](#8-checklist-de-qualidade)

---

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|-----------|--------------|-----------|
| Node.js | 16.x | `node -v` |
| npm | 8.x | `npm -v` |
| Angular CLI | 14.x | `ng version` |
| Git | 2.x | `git --version` |

---

## 2. Configuração do Ambiente

```bash
# 1. Clonar o repositório
git clone https://github.com/maicongsilva/face-site-anuncios.git
cd face-site-anuncios

# 2. Instalar dependências
npm install

# 3. Iniciar em modo de desenvolvimento (com proxy para :8080)
npm start

# 4. Executar testes
npm test
```

A aplicação estará disponível em `http://localhost:4200`.

---

## 3. Ciclo de Desenvolvimento

```
┌─────────────────────────────────────────────────────┐
│                  CICLO DE DESENVOLVIMENTO            │
│                                                     │
│  1. PLANEJAR     2. IMPLEMENTAR    3. DOCUMENTAR    │
│  ─────────────   ──────────────    ────────────     │
│  • Criar issue   • Branch da       • Atualizar      │
│  • Definir       feature           docs/ relevantes │
│    escopo        • Codificar       • Atualizar      │
│  • Atualizar     • Testar local    CHANGELOG.md     │
│    SDD se                                          │
│    arquitetural                                    │
│                                                     │
│  4. REVISAR      5. MERGEAR        6. RELEASE       │
│  ─────────────   ──────────────    ────────────     │
│  • Checklist     • Squash merge    • Tag de versão  │
│    de qualidade  • Fechar issue    • Atualizar      │
│  • Code review                     CHANGELOG.md     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.1 Planejamento

1. Criar uma **Issue** no GitHub descrevendo a funcionalidade ou bug
2. Discutir o escopo e abordagem nos comentários da issue
3. Se houver decisão arquitetural, adicionar ADR em `docs/02-architecture.md`
4. Atribuir a issue a um responsável

### 3.2 Implementação

```bash
# Criar branch a partir da main (sempre atualizada)
git checkout main
git pull origin main
git checkout -b <tipo>/<descricao-curta>

# Exemplos de nomes de branch:
# feat/filtro-por-cidade
# fix/login-erro-401
# docs/atualizar-modelos
# refactor/extrair-profile-module
```

### 3.3 Teste Local

```bash
# Executar testes unitários
npm test

# Verificar build de produção (sem erros de compilação)
npm run build
```

### 3.4 Pull Request

1. Garantir que o `CHANGELOG.md` foi atualizado
2. Garantir que os docs relevantes foram atualizados
3. Abrir PR com título seguindo padrão de commit (ver seção 5)
4. Preencher o template de PR
5. Aguardar aprovação de pelo menos 1 revisor

---

## 4. Padrões de Código

### 4.1 Nomenclatura

| Artefato | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `AnuncioListComponent` |
| Serviços | PascalCase + `Service` | `AnuncioService` |
| Interfaces/Modelos | PascalCase | `Anuncio`, `AuthUser` |
| Arquivos de componente | kebab-case | `anuncio-list.component.ts` |
| Arquivos de serviço | kebab-case | `anuncio.service.ts` |
| Variáveis/Propriedades | camelCase | `anunciosList`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `PAGE_SIZE` |
| BehaviorSubjects | camelCase + `$` | `currentUser$`, `isLoggedIn$` |

### 4.2 Estrutura de Componente

```typescript
@Component({
  selector: 'app-meu',
  templateUrl: './meu.component.html',
  styleUrls: ['./meu.component.scss']
})
export class MeuComponent implements OnInit, OnDestroy {
  // 1. Propriedades públicas (estado)
  loading = false;
  errorMessage = '';
  
  // 2. Propriedades privadas
  private destroy$ = new Subject<void>();
  
  // 3. Constructor com injeções
  constructor(
    private meuService: MeuService,
    private router: Router
  ) {}
  
  // 4. Ciclo de vida
  ngOnInit(): void { ... }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // 5. Handlers de template (event handlers)
  onSubmit(): void { ... }
  onFiltroChange(): void { ... }
  
  // 6. Métodos privados
  private carregarDados(): void { ... }
}
```

### 4.3 Regras de TypeScript

- **Strict mode ativado** — sem `any` implícito
- **Tipos explícitos** em retornos de funções públicas
- **Interfaces para modelos de dados**, não classes
- **Sem `!` (non-null assertion)** sem comentário justificando
- **Evitar `subscribe` aninhados** — usar `switchMap`, `mergeMap`, `forkJoin`

### 4.4 Estrutura de Template (HTML)

- Máximo de **1 nível de binding complexo** por linha
- Extrair lógica de template para métodos no `.ts`
- Usar **`async pipe`** quando possível em vez de subscribe manual
- Atributos na ordem: diretivas estruturais → binding → eventos → resto

```html
<!-- ✅ Correto -->
<div *ngIf="loading" class="spinner"></div>
<mat-card *ngFor="let item of items; trackBy: trackById" [class.ativo]="item.ativo" (click)="onSelect(item)">

<!-- ❌ Evitar -->
<mat-card *ngFor="let item of items" [class]="item.ativo ? 'card ativo' : 'card'" (click)="onSelect(item)" style="margin:10px">
```

---

## 5. Padrões de Commit

Este projeto segue o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

### Formato

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional - referência de issue]
```

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Atualização de documentação |
| `style` | Formatação (sem mudança de lógica) |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou correção de testes |
| `chore` | Atualizações de build, dependências |
| `perf` | Melhoria de performance |

### Exemplos

```
feat(chat): adicionar auto-scroll ao receber nova mensagem

fix(login): corrigir redirecionamento duplo ao estar logado

docs(sdd): atualizar modelos de dados com campo imagemUrl[]

refactor(profile): extrair ProfileModule com lazy loading

chore(deps): atualizar Angular Material para v14.2.7
```

---

## 6. Processo de Pull Request

### Template de PR

```markdown
## Descrição
Breve descrição do que foi alterado e por quê.

## Tipo de Mudança
- [ ] Bug fix (correção sem quebra de API)
- [ ] Nova feature (adição sem quebra de API)
- [ ] Breaking change (mudança que quebra funcionalidade existente)
- [ ] Documentação

## Issue Relacionada
Closes #<número>

## Checklist
- [ ] Testes passando (`npm test`)
- [ ] Build sem erros (`npm run build`)
- [ ] Documentação atualizada em `docs/`
- [ ] CHANGELOG.md atualizado
- [ ] Sem `console.log` de debug no código
- [ ] Checklist de segurança (08-security.md) verificado
```

### Critérios de Aprovação

- ✅ Todos os checks do CI passando
- ✅ Pelo menos 1 review aprovado
- ✅ Documentação atualizada
- ✅ Sem conflitos com `main`

---

## 7. Atualizando a Documentação

| Situação | Documentos a atualizar |
|----------|----------------------|
| Novo componente | `docs/04-components.md` |
| Novo módulo | `docs/03-modules.md`, `docs/07-routing.md` |
| Novo serviço | `docs/05-services.md` |
| Novo modelo/interface | `docs/06-data-models.md` |
| Nova rota | `docs/07-routing.md` |
| Mudança de segurança | `docs/08-security.md` |
| Novo endpoint de API | `docs/09-api-integration.md` |
| Mudança de UI/tema | `docs/10-ui-ux.md` |
| Qualquer release | `docs/CHANGELOG.md` |
| Decisão arquitetural | `docs/02-architecture.md` (seção ADR) |

---

## 8. Checklist de Qualidade

Execute antes de abrir o PR:

```bash
# 1. Testes unitários
npm test -- --watch=false

# 2. Build de produção (valida compilação TypeScript)
npm run build

# 3. Auditoria de segurança de dependências
npm audit

# 4. Verificar erros do TypeScript
npx tsc --noEmit
```

### Verificações Manuais

- [ ] A feature funciona no browser (Chrome + Firefox)
- [ ] A feature funciona em tela mobile (≤ 768px)
- [ ] Mensagens de erro são exibidas ao usuário (não apenas no console)
- [ ] Loading state é visível durante operações assíncronas
- [ ] Não há `console.log`, `console.error` ou `debugger` no código final
- [ ] Formulários têm validação visual funcional
- [ ] Rotas protegidas redirecionam ao `/login` quando não autenticado
