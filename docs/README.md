# Documentação SDD — Face Site Anúncios

> **Padrão:** IEEE 1016 — Software Design Description  
> **Versão do documento:** 1.0.0  
> **Data de criação:** 2026-05-09  
> **Responsável:** Equipe de Desenvolvimento  

---

## Índice da Documentação

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | [01-overview.md](./01-overview.md) | Visão geral do sistema, objetivos e escopo |
| 2 | [02-architecture.md](./02-architecture.md) | Arquitetura de alto nível (diagrama, camadas, padrões) |
| 3 | [03-modules.md](./03-modules.md) | Design dos módulos Angular (feature modules) |
| 4 | [04-components.md](./04-components.md) | Design detalhado de cada componente |
| 5 | [05-services.md](./05-services.md) | Design dos serviços e lógica de negócio |
| 6 | [06-data-models.md](./06-data-models.md) | Modelos de dados, interfaces e DTOs |
| 7 | [07-routing.md](./07-routing.md) | Estrutura de roteamento e navegação |
| 8 | [08-security.md](./08-security.md) | Segurança: Guards, Interceptors, JWT |
| 9 | [09-api-integration.md](./09-api-integration.md) | Integração com a API REST do backend |
| 10 | [10-ui-ux.md](./10-ui-ux.md) | Decisões de UI/UX, temas e componentes visuais |
| 11 | [11-best-practices.md](./11-best-practices.md) | Boas práticas de desenvolvimento (Angular, RxJS, TypeScript, testes) |
| 12 | [CHANGELOG.md](./CHANGELOG.md) | Histórico de alterações do sistema |
| 13 | [CONTRIBUTING.md](./CONTRIBUTING.md) | Guia do ciclo de desenvolvimento e contribuição |

---

## Como usar esta documentação

```
docs/
├── README.md              ← Você está aqui (índice central)
├── 01-overview.md         ← Leia primeiro: contexto e objetivos
├── 02-architecture.md     ← Decisões arquiteturais e estrutura
├── 03-modules.md          ← Módulos Angular e suas responsabilidades
├── 04-components.md       ← Cada componente: inputs, outputs, estado
├── 05-services.md         ← Serviços, contratos e fluxo de dados
├── 06-data-models.md      ← Interfaces TypeScript e contratos de API
├── 07-routing.md          ← Rotas, guards e navegação
├── 08-security.md         ← Autenticação, autorização e boas práticas
├── 09-api-integration.md  ← Endpoints, proxies e tratamento de erros
├── 10-ui-ux.md            ← Biblioteca de componentes e diretrizes visuais
├── 11-best-practices.md   ← Boas práticas: Angular, RxJS, TypeScript, testes, segurança
├── CHANGELOG.md           ← Registro de mudanças por versão
└── CONTRIBUTING.md        ← Ciclo de desenvolvimento e padrões de código
```

---

## Ciclo de Manutenção desta Documentação

1. **Nova feature ou componente** → atualizar `04-components.md`, `03-modules.md`, `07-routing.md`
2. **Novo serviço ou integração** → atualizar `05-services.md`, `09-api-integration.md`
3. **Alteração de modelo/DTO** → atualizar `06-data-models.md`
4. **Alteração de segurança** → atualizar `08-security.md`
5. **Nova prática ou padrão de código** → atualizar `11-best-practices.md`
6. **Qualquer release** → registrar entrada em `CHANGELOG.md`
7. **Alterações arquiteturais** → atualizar `02-architecture.md` com ADR (Architecture Decision Record)

> **Regra:** Nenhum PR deve ser mergeado sem a documentação correspondente atualizada.
