# 06 — Modelos de Dados

> **Documento:** SDD — Software Design Description  
> **Seção:** 6 — Data Design  
> **Padrão:** IEEE 1016-2009  

---

## 6.1 Localização

Todos os modelos residem em:
```
src/app/shared/model/
├── admin.model.ts
├── anuncio.model.ts
├── auth.model.ts
├── chat-thread.model.ts
├── chat.model.ts
├── itens.model.ts          ← Legado, não utilizado
└── responsePageable.model.ts
```

---

## 6.2 AuthUser

**Arquivo:** `src/app/shared/model/auth.model.ts`

Representa o usuário autenticado retornado pela API após login ou registro.

```typescript
interface AuthUser {
  id: number;
  nome: string;
  email: string;
  documento?: string;       // CPF/CNPJ (opcional)
  telefone?: string;        // Telefone de contato (opcional)
  role: 'USER' | 'ADMIN';   // Papel do usuário no sistema
  dataCriacao: string;      // ISO 8601
  dataAtualizacao?: string; // ISO 8601
}
```

### AuthResponse

Retorno do endpoint de login. Encapsula o token e os dados do usuário.

```typescript
interface AuthResponse {
  token: string;            // JWT Bearer Token
  user: AuthUser;           // Dados do usuário autenticado
}
```

### UpdateProfilePayload

Payload para atualização de perfil (`PUT /usuarios/me`).

```typescript
interface UpdateProfilePayload {
  nome?: string;
  email?: string;
  senha?: string;           // Nova senha (opcional, sem validação de senha atual)
  documento?: string;
  telefone?: string;
}
```

---

## 6.3 Anuncio

**Arquivo:** `src/app/shared/model/anuncio.model.ts`

Entidade central da plataforma.

```typescript
interface Anuncio {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;        // ex: 'Eletrônicos', 'Veículos', 'Imóveis'
  localizacao: string;      // Cidade/UF
  preco: number;
  imagemUrl?: string;       // URL principal (primeira imagem)
  imagens?: string[];       // Lista de URLs de imagens adicionais
  favoritado?: boolean;     // Se o usuário atual favoritou
  totalFavoritos?: number;  // Contagem total de favoritos
  usuarioId: number;        // ID do anunciante
  usuarioNome?: string;     // Nome do anunciante (desnormalizado)
  status: 'ATIVO' | 'INATIVO' | 'VENDIDO';
  dataCriacao: string;      // ISO 8601
  dataAtualizacao?: string; // ISO 8601
}
```

### AnuncioPage

Resposta paginada de anúncios (padrão Spring Page).

```typescript
interface AnuncioPage {
  content: Anuncio[];
  totalElements: number;
  totalPages: number;
  number: number;         // Página atual (0-indexed)
  size: number;           // Tamanho da página
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

---

## 6.4 ChatMessage

**Arquivo:** `src/app/shared/model/chat.model.ts`

Representa uma mensagem individual em uma thread de chat.

```typescript
interface ChatMessage {
  id: number;
  anuncioId: number;
  conteudo: string;
  dataEnvio: string;         // ISO 8601
  remetenteId: number;
  remetenteNome: string;
  destinatarioId: number;
  destinatarioNome: string;
  lida?: boolean;
}
```

---

## 6.5 ChatThread

**Arquivo:** `src/app/shared/model/chat-thread.model.ts`

Representa uma conversa (thread) entre dois usuários sobre um anúncio específico.

```typescript
interface ChatThread {
  anuncioId: number;
  anuncioTitulo?: string;
  outroUsuarioId: number;
  outroUsuarioNome?: string;
  ultimoConteudo: string;           // Preview da última mensagem
  dataUltimaMensagem: string;       // ISO 8601
  naoLidas: number;                 // Quantidade de mensagens não lidas
}
```

---

## 6.6 AdminDashboard

**Arquivo:** `src/app/shared/model/admin.model.ts`

Dados do painel administrativo.

```typescript
interface AdminDashboard {
  totalUsuarios: number;
  totalAnuncios: number;
  totalAnunciosAtivos: number;
  totalFavoritos: number;
}
```

---

## 6.7 ResponsePageable (Genérico)

**Arquivo:** `src/app/shared/model/responsePageable.model.ts`

Wrapper genérico para respostas paginadas da API.

```typescript
interface ResponsePageable<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;           // Página atual (0-indexed)
  size: number;
  numberOfElements: number; // Elementos na página atual
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

**Uso:**
```typescript
// Exemplo de uso em serviço
getAnuncios(): Observable<ResponsePageable<Anuncio>> {
  return this.http.get<ResponsePageable<Anuncio>>(this.baseUrl);
}
```

---

## 6.8 Modelo de Domínio (Diagrama)

```
┌──────────────┐       ┌──────────────┐
│   AuthUser   │       │   Anuncio    │
├──────────────┤       ├──────────────┤
│ id           │ 1   n │ id           │
│ nome         ├───────► usuarioId    │
│ email        │       │ titulo       │
│ documento    │       │ descricao    │
│ telefone     │       │ categoria    │
│ role         │       │ localizacao  │
│ dataCriacao  │       │ preco        │
└──────┬───────┘       │ imagens[]    │
       │               │ status       │
       │ 1           n │ dataCriacao  │
       │         ┌─────┴─────┐       │
       │         │ Favoritos │       │
       │         └─────┬─────┘       │
       │               │             │
       │ 1         n ┌─┴──────────┐  │
       └─────────────► ChatThread │  │
                    ├─────────────┤  │
                    │ anuncioId ──┼──┘
                    │ outroUsuId  │
                    │ naoLidas    │
                    └──────┬──────┘
                           │ 1    n
                    ┌──────▼──────┐
                    │ ChatMessage │
                    ├─────────────┤
                    │ id          │
                    │ conteudo    │
                    │ dataEnvio   │
                    │ remetenteId │
                    │ destinId    │
                    └─────────────┘
```

---

## 6.9 Regras de Modelagem

1. **Interfaces, não Classes** — modelos são definidos como `interface`, não `class` (exceto quando necessário instanciar)
2. **Campos opcionais explícitos** — usar `?` para campos não garantidos pela API
3. **ISO 8601 para datas** — datas sempre como `string` no formato ISO 8601; formatar no template com `DatePipe`
4. **IDs sempre `number`** — nunca `string` para IDs de entidades
5. **Campos desnormalizados documentados** — campos como `usuarioNome` (que vêm do backend por conveniência) devem ser marcados com comentário `// desnormalizado`
6. **Nenhum modelo compartilha referência circular** — se necessário, usar ID como referência

---

## 6.10 Adicionando Novos Modelos

Ao criar um novo modelo:

1. Criar arquivo em `src/app/shared/model/<nome>.model.ts`
2. Nomear interface com PascalCase: `MinhaEntidade`
3. Documentar campos com comentários inline
4. Atualizar este documento (`06-data-models.md`) com a nova seção
5. Se for paginável, usar `ResponsePageable<MinhaEntidade>`
