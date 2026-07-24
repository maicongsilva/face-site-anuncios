# CHANGELOG

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

### Planejado
- Migração para Feature Modules com lazy loading para Profile, Admin, Chat e Messages
- Criação de `AdminGuard` dedicado para rotas de administração
- Remoção de `ItemService` (descontinuado)
- Consolidação de `UsuarioService` no `AuthService`

---

## [1.0.0] — 2026-05-09

### Adicionado
- Sistema completo de autenticação com JWT (login e registro)
- Listagem de anúncios com paginação (6 itens por página)
- Filtros avançados: texto, categoria, localização, faixa de preço
- Ordenação de anúncios por data e preço
- Detalhe de anúncio com galeria de imagens
- Sistema de favoritos para usuários autenticados
- Chat thread-based por anúncio com auto-refresh (5s)
- Lista de conversas com contador de não-lidas
- Polling de mensagens não lidas no AppComponent (20s)
- Perfil do usuário com abas (anúncios, favoritos, mensagens, perfil)
- Gerenciamento de anúncios próprios com upload de imagens
- Painel administrativo com métricas (role ADMIN)
- Busca textual via barra de pesquisa global
- AuthGuard para rotas protegidas
- AuthInterceptor para injeção automática de JWT
- Tratamento de erros centralizado com mensagens em PT-BR
- Animações de transição entre rotas
- Suporte a Angular Material (tema indigo-pink) + Bootstrap 5
- Configuração de proxy para desenvolvimento local
- Separação de ambientes (development/production)

---

## Guia de Versionamento

| Tipo de mudança | Incremento de versão |
|-----------------|---------------------|
| Correção de bug sem quebra de API | PATCH (x.x.**1**) |
| Nova feature sem quebra de API | MINOR (x.**1**.0) |
| Quebra de compatibilidade | MAJOR (**2**.0.0) |

## Tipos de Entrada no CHANGELOG

- **Adicionado** — novas funcionalidades
- **Modificado** — mudanças em funcionalidades existentes
- **Depreciado** — funcionalidades que serão removidas em versões futuras
- **Removido** — funcionalidades removidas
- **Corrigido** — correções de bugs
- **Segurança** — correções de vulnerabilidades
