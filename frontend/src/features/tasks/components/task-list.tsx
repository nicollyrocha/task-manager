"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";
import { TaskItem } from "./task-item";
import { TaskListError } from "./task-list-error";

/** Os dados chegam pré-carregados pelo SSR (ver `app/page.tsx`); depois o TanStack Query os mantém atualizados. */
export function TaskList() {
  const trpc = useTRPC();
  const tasks = useQuery(trpc.task.list.queryOptions());

  if (tasks.isPending) {
    return <p className="text-sm text-zinc-500">Carregando tarefas...</p>;
  }

  if (tasks.isError) {
    return (
      <TaskListError message={getErrorMessage(tasks.error)} onRetry={() => tasks.refetch()} retrying={tasks.isFetching} />
    );
  }

  if (tasks.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">Nenhuma tarefa cadastrada ainda.</p>
        <Link href="/tarefas/nova" className={buttonStyles("primary")}>
          Criar a primeira tarefa
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.data.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
