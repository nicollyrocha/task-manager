import Link from "next/link";
import { connection } from "next/server";
import { buttonStyles } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskListUnavailable } from "@/features/tasks/components/task-list-unavailable";
import { getErrorMessage } from "@/lib/trpc/errors";
import { getQueryClient, HydrateClient, trpc } from "@/lib/trpc/server";

export default async function TasksPage() {
  // Renderiza a cada requisição (a lista muda), nunca no build.
  await connection();

  // SSR: a lista é buscada no servidor e já chega pronta no HTML.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.task.list.queryOptions());
  const { error } = queryClient.getQueryState(trpc.task.list.queryKey()) ?? {};

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        <Link href="/tarefas/nova" className={buttonStyles("primary")}>
          Nova tarefa
        </Link>
      </header>
      {error ? (
        <TaskListUnavailable message={getErrorMessage(error)} />
      ) : (
        <HydrateClient>
          <TaskList />
        </HydrateClient>
      )}
    </main>
  );
}
