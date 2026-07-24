# 10 — Design de UI/UX

> **Documento:** SDD — Software Design Description  
> **Seção:** 10 — UI/UX Design  
> **Padrão:** IEEE 1016-2009  

---

## 10.1 Biblioteca de Componentes UI

O projeto utiliza uma combinação de duas bibliotecas de UI:

| Biblioteca | Versão | Uso Principal |
|-----------|--------|---------------|
| **Angular Material** | v14 | Componentes funcionais (formulários, diálogos, cards, navegação) |
| **Bootstrap** | v5.2.2 | Grid system, utilitários de espaçamento e tipografia |
| **Font Awesome** | v4.7.0 | Ícones complementares |

> **Regra:** Preferir componentes Material para elementos interativos. Usar Bootstrap apenas para layout e utilitários de espaçamento.

---

## 10.2 Tema Angular Material

**Tema atual:** `indigo-pink` (pré-compilado)

**Arquivo de configuração:** `angular.json`
```json
"styles": [
  "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
  "src/styles.scss"
]
```

### Paleta de Cores do Tema

| Nome | Cor |
|------|-----|
| Primary | Indigo (#3F51B5) |
| Accent | Pink (#E91E63) |
| Warn | Red (#F44336) |
| Background | Cinza claro (#FAFAFA) |
| Surface | Branco (#FFFFFF) |

### Estilos Globais

**Arquivo:** `src/styles.scss`

Customizações globais aplicadas sobre o tema Material:
- Reset de margens e paddings padrão
- Tipografia base (`font-family`, tamanhos)
- Classes utilitárias de layout

---

## 10.3 Módulos Material Utilizados

| Módulo | Componente(s) | Uso |
|--------|--------------|-----|
| `MatToolbarModule` | `<mat-toolbar>` | Barra de navegação superior |
| `MatButtonModule` | `<button mat="...">` | Botões primários e secundários |
| `MatInputModule` | `<input matInput>` | Campos de formulário |
| `MatFormFieldModule` | `<mat-form-field>` | Container de campos com label/error |
| `MatIconModule` | `<mat-icon>` | Ícones Material Design |
| `MatCardModule` | `<mat-card>` | Cards de anúncios |
| `MatBadgeModule` | `matBadge` | Badge de notificações no ícone |
| `MatSnackBarModule` | `MatSnackBar` | Notificações toast |
| `MatTabsModule` | `<mat-tab-group>` | Abas no perfil do usuário |
| `MatSlideToggleModule` | `<mat-slide-toggle>` | Toggle switches |
| `MatSelectModule` | `<mat-select>` | Dropdowns de filtro |
| `MatPaginatorModule` | `<mat-paginator>` | Componente de paginação |
| `MatButtonToggleModule` | `<mat-button-toggle>` | Seleção de ordenação |

---

## 10.4 Layout e Responsividade

### Estratégia de Layout

A aplicação é responsiva usando combinação de:
- **CSS Grid/Flexbox** para layouts de componentes
- **Bootstrap Grid** (`col-`, `col-md-`, `col-lg-`) para layouts de página
- **Material Breakpoints** para visibilidade condicional

### Breakpoints (Bootstrap)

| Breakpoint | Prefixo | Min-width |
|------------|---------|-----------|
| Extra Small | (default) | < 576px |
| Small | `sm` | ≥ 576px |
| Medium | `md` | ≥ 768px |
| Large | `lg` | ≥ 992px |
| Extra Large | `xl` | ≥ 1200px |

### Menu Mobile

O `AppComponent` gerencia um `mobileMenuOpen: boolean` para controlar a exibição do menu de navegação em telas pequenas. O menu hamburguer é exibido via `[class.hidden]` ou `*ngIf` baseado em breakpoint CSS.

---

## 10.5 Padrões de Formulários

### Estrutura Padrão de Formulário Reativo

```html
<form [formGroup]="meuForm" (ngSubmit)="onSubmit()">
  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Campo</mat-label>
    <input matInput formControlName="campo" placeholder="Placeholder">
    <mat-error *ngIf="meuForm.get('campo')?.hasError('required')">
      Campo obrigatório
    </mat-error>
    <mat-error *ngIf="meuForm.get('campo')?.hasError('minlength')">
      Mínimo de X caracteres
    </mat-error>
  </mat-form-field>
  
  <button mat-raised-button color="primary" type="submit" [disabled]="loading || meuForm.invalid">
    <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
    {{ loading ? 'Carregando...' : 'Enviar' }}
  </button>
</form>
```

### Padrão de Feedback de Erro

```html
<!-- Mensagem de erro global abaixo do formulário -->
<div class="error-message" *ngIf="errorMessage">
  <mat-icon>error_outline</mat-icon>
  {{ errorMessage }}
</div>

<!-- Mensagem de sucesso -->
<div class="success-message" *ngIf="successMessage">
  <mat-icon>check_circle</mat-icon>
  {{ successMessage }}
</div>
```

---

## 10.6 Cards de Anúncios

Cada anúncio na listagem é exibido como um `<mat-card>` seguindo este padrão:

```html
<mat-card class="anuncio-card">
  <mat-card-header>
    <img mat-card-image [src]="anuncio.imagemUrl" [alt]="anuncio.titulo">
  </mat-card-header>
  <mat-card-content>
    <h3>{{ anuncio.titulo }}</h3>
    <p class="preco">{{ anuncio.preco | currency:'BRL' }}</p>
    <p class="localizacao">
      <mat-icon>location_on</mat-icon> {{ anuncio.localizacao }}
    </p>
    <mat-chip>{{ anuncio.categoria }}</mat-chip>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button [routerLink]="['/anuncios', anuncio.id]">Ver detalhes</button>
    <button mat-icon-button (click)="toggleFavorito(anuncio)">
      <mat-icon>{{ anuncio.favoritado ? 'favorite' : 'favorite_border' }}</mat-icon>
    </button>
  </mat-card-actions>
</mat-card>
```

---

## 10.7 Animações de Rota

As transições entre rotas usam animações Angular definidas no `AppComponent`:

| Animação | Comportamento |
|---------|---------------|
| Entrada | Slide da direita para a esquerda (`translateX(100%) → 0`) |
| Saída | Slide para fora pela esquerda (`0 → translateX(-100%)`) |
| Duração | 300ms com easing `ease-in-out` |

---

## 10.8 Internacionalização (i18n)

O sistema está em **Português Brasileiro (pt-BR)**:
- Mensagens de erro em `error.utils.ts`
- Labels de formulários nos templates
- Formatação de moeda: `currency:'BRL'`
- Formatação de data: `date:'dd/MM/yyyy HH:mm'`

> Não há suporte a múltiplos idiomas. O Angular i18n não está configurado.

---

## 10.9 Acessibilidade (a11y)

| Prática | Status |
|---------|--------|
| Labels associados a inputs | ✅ (via `<mat-label>`) |
| Contraste de cores | ✅ (tema Material garante WCAG AA) |
| Navegação por teclado | ✅ (Material Design) |
| ARIA attributes | ⚠️ Parcial (Material aplica automaticamente nos componentes) |
| Imagens com `alt` | ⚠️ Verificar consistência nos templates |

---

## 10.10 Diretrizes para Novos Componentes Visuais

1. **Usar componentes Material** como primeira opção
2. **Appearance `outline`** para todos os `<mat-form-field>`
3. **`mat-raised-button color="primary"`** para ações principais
4. **`mat-stroked-button`** para ações secundárias
5. **`mat-icon-button`** para ações de ícone (favoritar, excluir, editar)
6. **Loading state** visível ao usuário (spinner ou botão desabilitado com texto)
7. **Feedback de erro** sempre em texto (nunca apenas por cor)
8. **Responsividade** testada nos breakpoints `xs`, `md` e `lg`
