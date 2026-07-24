# 01 — Visão Geral do Sistema

> **Documento:** SDD — Software Design Description  
> **Seção:** 1 — System Overview  
> **Padrão:** IEEE 1016-2009  

---

## 1.1 Identificação do Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | Face Site Anúncios |
| **Tipo** | Single-Page Application (SPA) |
| **Framework** | Angular 14 |
| **Linguagem** | TypeScript 4.7 |
| **Backend** | REST API — `/api` (mesma origem no deploy Oracle VM) |
| **Ambiente de dev** | `http://localhost:4200` (proxy → `http://localhost:8080`) |
| **Repositório** | `maicongsilva/face-site-anuncios` |

---

## 1.2 Propósito do Sistema

O **Face Site Anúncios** é uma plataforma de anúncios classifiados que permite a usuários:

- Publicar, editar e remover anúncios com imagens
- Buscar e filtrar anúncios por categoria, localização e faixa de preço
- Favoritar anúncios de interesse
- Comunicar-se diretamente com anunciantes via chat integrado
- Gerenciar perfil pessoal e visualizar histórico de conversas

Usuários com papel **ADMIN** têm acesso a um painel de administração com métricas do sistema.

---

## 1.3 Escopo

### Funcionalidades incluídas (in-scope)

| ID | Funcionalidade | Módulo |
|----|----------------|--------|
| F01 | Cadastro de usuário | Register |
| F02 | Autenticação com JWT | Login |
| F03 | Listagem de anúncios com paginação | Home / AnuncioList |
| F04 | Filtros avançados (categoria, local, preço) | Home / AnuncioList |
| F05 | Detalhe do anúncio com galeria de imagens | AnuncioDetail |
| F06 | Sistema de favoritos | AnuncioDetail / Profile |
| F07 | Chat por anúncio (thread-based) | Chat / Messages |
| F08 | Contador de mensagens não lidas | AppComponent (polling) |
| F09 | Gerenciamento de perfil e anúncios próprios | Profile |
| F10 | Painel administrativo com métricas | Admin |
| F11 | Busca textual via barra de pesquisa | Pesquisa |

### Funcionalidades fora do escopo (out-of-scope)

- Pagamentos online
- Notificações push (WebSocket/SSE)
- Moderação de conteúdo automatizada
- Aplicação mobile nativa

---

## 1.4 Usuários do Sistema

| Papel | Descrição | Acesso |
|-------|-----------|--------|
| **Visitante** | Não autenticado | Leitura de anúncios, busca, cadastro |
| **Usuário autenticado** | Conta criada e logada | Todas as funcionalidades de F01–F09 |
| **Administrador** | Papel `ADMIN` no backend | Todas as anteriores + Painel Admin (F10) |

---

## 1.5 Restrições e Premissas

| Tipo | Descrição |
|------|-----------|
| **Tecnológica** | Requer navegador moderno com suporte a ES2015+ |
| **Dependência** | Frontend acoplado à API REST do backend |
| **Autenticação** | Baseada exclusivamente em tokens JWT (sem refresh token automático) |
| **Estado** | Sem gerenciamento de estado global (NgRx/Akita); usa BehaviorSubjects |
| **Upload de imagens** | Realizado diretamente via API; sem CDN dedicado |

---

## 1.6 Definições e Acrônimos

| Termo | Definição |
|-------|-----------|
| **SPA** | Single-Page Application — a aplicação não recarrega a página entre navegações |
| **JWT** | JSON Web Token — token de autenticação sem estado |
| **DTO** | Data Transfer Object — objeto que carrega dados entre camadas |
| **Guard** | Classe Angular que protege rotas de acesso não autorizado |
| **Interceptor** | Classe Angular que intercepta requisições HTTP |
| **BehaviorSubject** | Observable RxJS que armazena e emite o último valor emitido |
| **Anúncio** | Entidade principal da plataforma (item à venda ou para contato) |
| **Thread** | Sequência de mensagens de chat entre dois usuários por anúncio |
| **ADR** | Architecture Decision Record — registro de decisão arquitetural |

---

## 1.7 Referências

- [Angular v14 Docs](https://v14.angular.io/docs)
- [Angular Material v14](https://v14.material.angular.io/)
- [IEEE 1016-2009 — Software Design Descriptions](https://standards.ieee.org/standard/1016-2009.html)
- [RxJS v7 Docs](https://rxjs.dev/)
- [Proxy Configuration — Angular CLI](https://angular.io/guide/build#proxying-to-a-backend-server)
