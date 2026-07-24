# 04 — Design dos Componentes

> **Documento:** SDD — Software Design Description  
> **Seção:** 4 — Component Design  
> **Padrão:** IEEE 1016-2009  

---

## Convenção de Documentação de Componentes

Cada componente é descrito com:
- **Responsabilidade:** O que o componente faz
- **Seletor:** Tag HTML utilizada
- **Rota:** URL que o renderiza (se aplicável)
- **Inputs / Outputs:** Dados recebidos e emitidos
- **Estado local:** Propriedades internas principais
- **Serviços injetados:** Dependências
- **Comportamentos especiais:** Ciclo de vida, timers, etc.

---

## 4.1 AppComponent

**Arquivo:** `src/app/app.component.ts`  
**Seletor:** `app-root`  
**Rota:** raiz (sempre presente)

### Responsabilidade
Shell principal da aplicação. Gerencia a barra de navegação, animações de rota, estado de autenticação e contador de mensagens não lidas.

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `isLoggedIn` | `boolean` | Indica se há usuário autenticado |
| `currentUser` | `AuthUser \| null` | Dados do usuário atual |
| `unreadCount` | `number` | Quantidade de mensagens não lidas |
| `mobileMenuOpen` | `boolean` | Estado do menu mobile |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AuthService` | Assina `isLoggedIn$` e `currentUser$` |
| `ChatService` | Busca contador de não-lidas |
| `Router` | Animações de transição de rota |

### Comportamentos Especiais
- **Polling:** `setInterval(20_000)` para `chatService.getUnreadCount()` enquanto autenticado
- **Animação:** Trigger `routeAnimations` com slide horizontal entre rotas
- **Role-based nav:** Exibe link `/admin` apenas para `role === 'ADMIN'`
- **Cleanup:** `clearInterval` no `ngOnDestroy`

---

## 4.2 LoginComponent

**Arquivo:** `src/app/login/login.component.ts`  
**Seletor:** `app-login`  
**Rota:** `/login`

### Responsabilidade
Formulário de autenticação. Valida credenciais e redireciona o usuário autenticado.

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `loginForm` | `FormGroup` | Grupo reativo com `email` e `senha` |
| `loading` | `boolean` | Controla o estado do botão de submit |
| `errorMessage` | `string` | Mensagem de erro exibida ao usuário |

### Validações do Formulário
| Campo | Validadores |
|-------|-------------|
| `email` | `Validators.required`, `Validators.email` |
| `senha` | `Validators.required`, `Validators.minLength(6)` |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AuthService` | `login()`, `isLoggedIn()` |
| `Router` | Redireciona para `/minha-conta` após login |

### Fluxo de Login
```
ngOnInit → isLoggedIn() === true → Router.navigate('/minha-conta')
submit() → loginForm.valid → AuthService.login() → sucesso → Router.navigate('/minha-conta')
                                                  → erro → errorMessage = getErrorMessage(err, 'login')
```

---

## 4.3 RegisterComponent

**Arquivo:** `src/app/register/register.component.ts`  
**Seletor:** `app-register`  
**Rota:** `/register`

### Responsabilidade
Formulário de cadastro de novo usuário com validação completa e feedback de sucesso/erro.

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `registerForm` | `FormGroup` | Campos de cadastro |
| `loading` | `boolean` | Estado de carregamento |
| `successMessage` | `string` | Feedback positivo |
| `errorMessage` | `string` | Feedback de erro |

### Validações do Formulário
| Campo | Validadores | Obrigatório |
|-------|-------------|-------------|
| `nome` | `required`, `minLength(5)` | ✅ |
| `email` | `required`, `email` | ✅ |
| `senha` | `required`, `minLength(6)` | ✅ |
| `documento` | Nenhum | ❌ |
| `telefone` | Nenhum | ❌ |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AuthService` | `register(payload)` |
| `Router` | Redireciona para `/login` após cadastro |

---

## 4.4 AnuncioListComponent

**Arquivo:** `src/app/home/anuncio-list/anuncio-list.component.ts`  
**Seletor:** `app-anuncio-list`  
**Rota:** `/` (rota filha do HomeModule)

### Responsabilidade
Lista paginada de anúncios com filtros avançados e ordenação.

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `anuncios` | `Anuncio[]` | Lista da página atual |
| `totalElements` | `number` | Total de itens para paginação |
| `currentPage` | `number` | Página atual (0-indexed) |
| `pageSize` | `number` | Itens por página (padrão: 6) |
| `searchTerm` | `string` | Filtro por texto |
| `categoriaFiltro` | `string` | Filtro por categoria |
| `localizacaoFiltro` | `string` | Filtro por localização |
| `precoMin` / `precoMax` | `number` | Faixa de preço |
| `ordenacao` | `string` | Campo de ordenação |
| `loading` | `boolean` | Estado de carregamento |

### Inputs
_Nenhum (dados carregados via serviço)_

### Comportamentos Especiais
- **Leitura de query params:** Ao inicializar, lê `?q=` da URL para pré-preencher `searchTerm`
- **Debounce:** Filtros de texto usam debounce de 300ms para evitar chamadas excessivas
- **Paginação Material:** Usa `MatPaginator` com evento `(page)` para navegar

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AnuncioService` | `getAnuncios(page, size, filters)` |
| `ActivatedRoute` | Lê query param `q` |

---

## 4.5 AnuncioDetailComponent

**Arquivo:** `src/app/anuncio-detail/anuncio-detail.component.ts`  
**Seletor:** `app-anuncio-detail`  
**Rota:** `/anuncios/:id`

### Responsabilidade
Exibe todos os detalhes de um anúncio específico, com galeria de imagens, anúncios relacionados, favorito e início de chat.

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `anuncio` | `Anuncio \| null` | Anúncio principal |
| `relacionados` | `Anuncio[]` | Sugestões de anúncios similares |
| `isFavorito` | `boolean` | Estado de favorito do usuário atual |
| `selectedImage` | `string` | URL da imagem ativa na galeria |
| `isLoggedIn` | `boolean` | Controle de visibilidade de ações |
| `isOwner` | `boolean` | Verifica se o usuário é o anunciante |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AnuncioService` | `getById(id)`, `getRelacionados()`, `toggleFavorito()` |
| `AuthService` | `getCurrentUser()`, `isLoggedIn()` |
| `ChatService` | `iniciarChat(anuncioId, destinatarioId)` |
| `ActivatedRoute` | Lê `:id` da rota |
| `Router` | Navega para o chat iniciado |

---

## 4.6 ProfileComponent

**Arquivo:** `src/app/profile/profile.component.ts`  
**Seletor:** `app-profile`  
**Rota:** `/minha-conta` 🔒 (requer autenticação)

### Responsabilidade
Dashboard do usuário: visualização e edição de perfil, gerenciamento de anúncios próprios, favoritos e conversas.

### Abas (MatTabs)
| Tab | Conteúdo |
|-----|----------|
| Meus Anúncios | Lista de anúncios do usuário com ações de editar/excluir/upload de imagens |
| Favoritos | Anúncios favoritados |
| Mensagens | Threads de conversa |
| Meu Perfil | Formulário de edição de dados pessoais |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AnuncioService` | CRUD de anúncios, upload de imagem |
| `AuthService` | Dados do usuário, `updateProfile()` |
| `ChatService` | Lista de threads do usuário |

---

## 4.7 ChatComponent

**Arquivo:** `src/app/chat/chat.component.ts`  
**Seletor:** `app-chat`  
**Rota:** `/chat/:id` 🔒 (requer autenticação)

### Responsabilidade
Interface de mensagens para uma thread específica (por anúncio + usuário).

### Estado Local
| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `messages` | `ChatMessage[]` | Lista de mensagens da thread |
| `newMessage` | `string` | Conteúdo da mensagem a enviar |
| `anuncioId` | `number` | ID do anúncio da conversa |
| `outroUsuarioId` | `number` | ID do outro participante |
| `loading` | `boolean` | Estado de carregamento inicial |

### Comportamentos Especiais
- **Auto-refresh:** `setInterval(5_000)` para recarregar mensagens
- **Agrupamento visual:** Mensagens consecutivas do mesmo remetente são agrupadas
- **Scroll automático:** Rola para a última mensagem ao carregar novas

### Parâmetros de Rota
| Parâmetro | Tipo | Origem |
|-----------|------|--------|
| `:id` | `number` | `anuncioId` via `ActivatedRoute.params` |
| `?usuario` | `number` | `outroUsuarioId` via `ActivatedRoute.queryParams` |

---

## 4.8 MessagesComponent

**Arquivo:** `src/app/messages/messages.component.ts`  
**Seletor:** `app-messages`  
**Rota:** `/mensagens` 🔒 (requer autenticação)

### Responsabilidade
Lista todas as threads de conversa do usuário com contador de não-lidas por thread.

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `ChatService` | `getThreads()` |
| `Router` | Navega para `/chat/:anuncioId?usuario=:id` |

---

## 4.9 AdminComponent

**Arquivo:** `src/app/admin/admin.component.ts`  
**Seletor:** `app-admin`  
**Rota:** `/admin` 🔒 (requer autenticação + papel ADMIN)

### Responsabilidade
Painel administrativo com métricas do sistema.

### Métricas Exibidas
| Métrica | Descrição |
|---------|-----------|
| Total de Usuários | Contagem geral |
| Total de Anúncios | Todos os anúncios |
| Anúncios Ativos | Apenas anúncios com status ativo |
| Total de Favoritos | Somatorio de favoritos no sistema |

### Serviços Injetados
| Serviço | Uso |
|---------|-----|
| `AdminService` | `getDashboard()` |
| `AuthService` | Verificação de papel ADMIN |
| `Router` | Redireciona se não for ADMIN |

---

## 4.10 PesquisaComponent

**Arquivo:** `src/app/pesquisa/pesquisa.component.ts`  
**Seletor:** `app-pesquisa`  
**Rota:** `/pesquisa`

### Responsabilidade
Barra de pesquisa global. Recebe input do usuário e navega para a listagem com o query param `?q=`.

### Fluxo
```
Input do usuário → pesquisar() → Router.navigate(['/'], { queryParams: { q: termo } })
```

---

## 4.11 Padrões de Implementação de Componentes

### Ciclo de Vida Esperado

```typescript
export class MeuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribes com takeUntil para evitar memory leaks
    this.service.dado$.pipe(takeUntil(this.destroy$)).subscribe(valor => {
      this.propriedade = valor;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Limpar setInterval, setTimeouts, etc.
  }
}
```

### Regras de Componentes

1. **Sem lógica de negócio no template** — usar métodos no `.ts`
2. **Subscriptions sempre destruídas** — usar `takeUntil(destroy$)` ou `async pipe`
3. **Loading state** — todo componente que carrega dados deve ter `loading: boolean`
4. **Error state** — todo componente deve tratar e exibir erros de forma amigável
5. **Sem chamadas HTTP diretas** — sempre via serviço injetado
