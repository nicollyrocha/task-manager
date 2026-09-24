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
        ├── app/                 # rotas: listagem (/), nova e editar tarefa; loading, error, not-found
        ├── components/ui/       # botões e toasts de feedback
        ├── lib/trpc/            # clientes tRPC (browser e servidor/SSR), query client, tradução de erros
        └── features/tasks/      # componentes, hooks, validação e tipos da feature de tarefas
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

> Os dados ficam **em memória**, sem banco de dados: são perdidos sempre que o backend reinicia (inclusive no reinício automático do `npm run dev` ao salvar um arquivo do backend).

## Páginas

| Rota                    | Descrição                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| `/`                     | Listagem pré-carregada via SSR, com exclusão direto na lista              |
| `/tarefas/nova`         | Formulário de criação                                                     |
| `/tarefas/[id]/editar`  | Formulário de edição (id inexistente mostra "Não encontrado")             |

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.9 ou superior** (exigido pelo Next.js 16)
- npm (vem com o Node.js)

### 1. Clonar e instalar as dependências

```bash
git clone https://github.com/nicollyrocha/task-manager.git
cd task-manager
npm install
```

Um único `npm install` na raiz instala as dependências do frontend e do backend (npm workspaces).

### 2. Configurar as variáveis de ambiente

Copie os arquivos de exemplo. No Linux/macOS ou Git Bash:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

No Windows (PowerShell):

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Os valores padrão já funcionam localmente; esse passo é opcional se você não for mudar portas.

| Arquivo               | Variável               | Padrão                         | Descrição                                     |
| --------------------- | ---------------------- | ------------------------------ | --------------------------------------------- |
| `backend/.env`        | `PORT`                 | `3333`                         | Porta da API                                  |
| `backend/.env`        | `CORS_ORIGIN`          | `http://localhost:3000`        | Origem liberada para chamar a API (frontend)  |
| `backend/.env`        | `NODE_ENV`             | `development`                  | `development`, `production` ou `test`         |
| `frontend/.env.local` | `NEXT_PUBLIC_TRPC_URL` | `http://localhost:3333/trpc`   | URL da API tRPC                               |

Se mudar a porta de um lado, ajuste a variável correspondente do outro (`CORS_ORIGIN` ou `NEXT_PUBLIC_TRPC_URL`).

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Sobe os dois juntos, com recarregamento automático:

- Frontend: <http://localhost:3000>
- API tRPC: <http://localhost:3333/trpc> (ex.: <http://localhost:3333/trpc/health>)

Para subir só um deles: `npm run dev:backend` ou `npm run dev:frontend`. O frontend precisa do backend rodando para listar e salvar tarefas; sem ele, a interface mostra a mensagem de erro de conexão.

### 4. Rodar em modo produção

```bash
npm run build
npm run start -w backend
npm run start -w frontend
```

Rode os dois `start` em terminais separados.

## Scripts

Executados na raiz do projeto:

| Script                  | O que faz                                              |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Backend e frontend em modo desenvolvimento             |
| `npm run dev:backend`   | Só o backend                                           |
| `npm run dev:frontend`  | Só o frontend                                          |
| `npm run build`         | Build de produção dos dois                             |
| `npm test`              | Testes do backend (Vitest)                             |
| `npm run lint`          | ESLint no frontend                                     |
| `npm run typecheck`     | Checagem de tipos TypeScript nos dois                  |

## Solução de problemas

- **"Não foi possível conectar ao servidor"** — o backend não está rodando ou está em outra porta. Confira o terminal do `npm run dev` e o valor de `NEXT_PUBLIC_TRPC_URL`.
- **Erro de CORS no console do navegador** — o frontend está em uma origem diferente de `CORS_ORIGIN` no `backend/.env`.
- **Porta em uso (`EADDRINUSE`)** — outro processo está usando a porta 3000 ou 3333. Encerre-o ou altere `PORT` (backend) / use `npm run dev -w frontend -- -p 3001` (frontend), ajustando as variáveis acima.
- **As tarefas sumiram** — é esperado: os dados ficam em memória e são apagados quando o backend reinicia.
