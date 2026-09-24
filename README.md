# Task Manager

Monorepo (npm workspaces) com frontend em **Next.js 16 + React 19** e backend em **Node.js + TypeScript + tRPC v11**.

## Estrutura

```
task-manager/
├── backend/                     # API tRPC (Express como servidor HTTP)
│   └── src/
│       ├── config/env.ts        # variáveis de ambiente validadas com Zod
│       ├── trpc/
│       │   ├── trpc.ts          # initTRPC, superjson, formatação de erros
│       │   ├── context.ts       # contexto por requisição (injeta os serviços)
│       │   └── router.ts        # appRouter + tipo AppRouter (exportado ao frontend)
│       ├── modules/task/
│       │   ├── task.schema.ts   # modelo Task + schemas de entrada (Zod)
│       │   ├── task.repository.ts  # interface + implementação em memória
│       │   ├── task.service.ts  # regras de negócio e erros (NOT_FOUND)
│       │   ├── task.router.ts   # procedures tRPC: list, byId, create, update, delete
│       │   └── task.router.test.ts
│       ├── app.ts               # Express + middleware tRPC em /trpc
│       └── server.ts
└── frontend/                    # Next.js (App Router)
    └── src/
        ├── app/                 # layout (TRPCReactProvider) e página
        ├── lib/trpc/            # cliente tRPC + TanStack Query
        └── features/tasks/      # componentes, hooks e tipos da feature de tarefas
```

O frontend importa apenas o **tipo** `AppRouter` (`import type ... from "backend/router"`), então as chamadas são tipadas ponta a ponta sem compartilhar código de runtime.

## Modelo

| Campo         | Tipo             | Regras                                  |
| ------------- | ---------------- | --------------------------------------- |
| `id`          | `string` (UUID)  | gerado automaticamente                  |
| `titulo`      | `string`         | obrigatório, 1–200 caracteres (trim)    |
| `descricao`   | `string \| null` | opcional, até 2000 caracteres           |
| `dataCriacao` | `Date`           | definida na criação                     |

## Procedures (`/trpc`)

| Procedure     | Tipo     | Entrada                              | Erros                         |
| ------------- | -------- | ------------------------------------ | ----------------------------- |
| `task.list`   | query    | —                                    | —                             |
| `task.byId`   | query    | `{ id }`                             | `BAD_REQUEST`, `NOT_FOUND`    |
| `task.create` | mutation | `{ titulo, descricao? }`             | `BAD_REQUEST` (sem título)    |
| `task.update` | mutation | `{ id, titulo?, descricao? \| null }` | `BAD_REQUEST`, `NOT_FOUND`    |
| `task.delete` | mutation | `{ id }`                             | `BAD_REQUEST`, `NOT_FOUND`    |

Erros de validação retornam HTTP 400 com a mensagem legível (ex.: `"O título é obrigatório"`) e os detalhes por campo em `data.zodError`; tarefa inexistente retorna HTTP 404 (`Tarefa com id "..." não encontrada`).

> Os dados ficam **em memória** e se perdem ao reiniciar o backend. Para persistir, crie outra implementação de `TaskRepository` e injete-a em `backend/src/trpc/context.ts`.

## Rodando

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev        # backend em :3333/trpc e frontend em :3000
```

Outros scripts: `npm run build`, `npm test` (Vitest no backend), `npm run lint`, `npm run typecheck`.
