# 03 — Design dos Módulos

> **Documento:** SDD — Software Design Description  
> **Seção:** 3 — Module Design  
> **Padrão:** IEEE 1016-2009  

---

## 3.1 AppModule (Módulo Raiz)

**Arquivo:** `src/app/app.module.ts`

### Responsabilidade
Módulo raiz da aplicação. Bootstraps o `AppComponent`, registra provedores globais e importa módulos compartilhados.

### Declarações
| Componente | Arquivo |
|------------|---------|
| `AppComponent` | `app.component.ts` |
| `RegisterComponent` | `register/register.component.ts` |
| `ProfileComponent` | `profile/profile.component.ts` |
| `AnuncioDetailComponent` | `anuncio-detail/anuncio-detail.component.ts` |
| `AdminComponent` | `admin/admin.component.ts` |
| `ChatComponent` | `chat/chat.component.ts` |
| `MessagesComponent` | `messages/messages.component.ts` |

### Módulos Importados
| Módulo | Propósito |
|--------|-----------|
| `BrowserModule` | Suporte base do Angular no browser |
| `BrowserAnimationsModule` | Habilita animações (Material Design) |
| `HttpClientModule` | Cliente HTTP para comunicação com a API |
| `ReactiveFormsModule` | Formulários reativos |
| `AppRoutingModule` | Roteamento principal |
| `HomeModule` | Feature module (lazy loaded via routing) |
| `LoginModule` | Feature module de login |
| `PesquisaModule` | Feature module de pesquisa |
| `MatToolbarModule` | Barra de navegação superior |
| `MatButtonModule` | Botões estilizados |
| `MatInputModule` | Inputs com Material Design |
| `MatIconModule` | Ícones Material |
| `MatButtonToggleModule` | Toggle buttons |
| `MatFormFieldModule` | Campos de formulário |
| `MatCardModule` | Cards de conteúdo |
| `MatBadgeModule` | Badge de notificações |
| `MatSnackBarModule` | Notificações toast |
| `MatTabsModule` | Abas de navegação |
| `MatSlideToggleModule` | Toggle switch |

### Provedores Globais
| Provider | Tipo | Descrição |
|----------|------|-----------|
| `AuthInterceptor` | `HTTP_INTERCEPTORS` (multi) | Adiciona JWT e normaliza erros HTTP |

---

## 3.2 HomeModule

**Arquivo:** `src/app/home/home.module.ts`  
**Carregamento:** Lazy (via `AppRoutingModule`)

### Responsabilidade
Contém a página inicial e a listagem de anúncios. É o módulo principal de navegação para visitantes e usuários autenticados.

### Componentes
| Componente | Rota | Descrição |
|------------|------|-----------|
| `HomeComponent` | `/` | Container da home page |
| `AnuncioListComponent` | `/` (filho) | Grade de anúncios com filtros e paginação |
| `NovoUsuarioComponent` | `/novousuario` | Página de boas-vindas pós-cadastro |

### Dependências de Módulos
| Módulo | Motivo |
|--------|--------|
| `CommonModule` | Diretivas `*ngIf`, `*ngFor` |
| `RouterModule` | Links de navegação |
| `HttpClientModule` | Requisições à API (via serviços) |
| `MatCardModule` | Cards de anúncios |
| `MatPaginatorModule` | Componente de paginação |
| `MatSelectModule` | Dropdowns de filtro |
| `MatInputModule` | Campo de busca |
| `FormsModule` | Binding de filtros |

---

## 3.3 LoginModule

**Arquivo:** `src/app/login/login.module.ts`  
**Carregamento:** Eager

### Responsabilidade
Gerencia o fluxo de autenticação de entrada do usuário.

### Componentes
| Componente | Rota | Descrição |
|------------|------|-----------|
| `LoginComponent` | `/login` | Formulário de login |

### Dependências de Módulos
| Módulo | Motivo |
|--------|--------|
| `CommonModule` | Diretivas básicas |
| `ReactiveFormsModule` | Formulário reativo com validação |
| `MatFormFieldModule` | Campos de formulário |
| `MatInputModule` | Inputs estilizados |
| `MatButtonModule` | Botão de submit |
| `MatSnackBarModule` | Feedback de erro/sucesso |
| `RouterModule` | Link para `/register` |

---

## 3.4 PesquisaModule

**Arquivo:** `src/app/pesquisa/pesquisa.module.ts`  
**Carregamento:** Eager

### Responsabilidade
Módulo de busca textual. Recebe o termo da URL e redireciona para a listagem filtrada.

### Componentes
| Componente | Rota | Descrição |
|------------|------|-----------|
| `PesquisaComponent` | `/pesquisa` | Barra de pesquisa com query params |

### Dependências de Módulos
| Módulo | Motivo |
|--------|--------|
| `CommonModule` | Diretivas básicas |
| `FormsModule` | Two-way binding do input de busca |
| `RouterModule` | Navegação com query params |
| `MatInputModule` | Input de pesquisa |
| `MatButtonModule` | Botão de busca |
| `MatIconModule` | Ícone de lupa |

---

## 3.5 RegisterModule

**Arquivo:** `src/app/register/register.module.ts`  
**Carregamento:** Eager (declarado no AppModule via import)

### Responsabilidade
Gerencia o fluxo de criação de conta de usuário.

### Componentes
| Componente | Rota | Descrição |
|------------|------|-----------|
| `RegisterComponent` | `/register` | Formulário de cadastro completo |

---

## 3.6 Diagrama de Dependências entre Módulos

```
AppModule
├── imports ─► AppRoutingModule
├── imports ─► HomeModule        [lazy via routing]
├── imports ─► LoginModule
├── imports ─► PesquisaModule
├── imports ─► RegisterModule
└── imports ─► Angular Material Modules (global)
```

---

## 3.7 Critérios para Criação de Novos Módulos

Um novo Feature Module deve ser criado quando:

1. **Escopo isolado:** o conjunto de componentes tem responsabilidade única e coesa
2. **Lazy loading possível:** o módulo não é necessário no carregamento inicial
3. **Reutilização:** o módulo pode ser importado em diferentes contextos
4. **3+ componentes relacionados:** componentes simples isolados não precisam de módulo próprio

### Template de Novo Módulo

```
src/app/<nome-feature>/
├── <nome-feature>.module.ts         ← Módulo Angular
├── <nome-feature>-routing.module.ts ← Rotas do módulo
├── <nome-feature>.component.ts      ← Componente principal
├── <nome-feature>.component.html    ← Template
└── <nome-feature>.component.scss    ← Estilos
```
