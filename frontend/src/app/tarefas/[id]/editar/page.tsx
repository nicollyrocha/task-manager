import { TRPCClientError } from "@trpc/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getQueryClient, trpc } from "@/lib/trpc/server";

export const metadata: Metadata = { title: "Editar tarefa | Task Manager" };

export default async function EditTaskPage({ params }: PageProps<"/tarefas/[id]/editar">) {
  const { id } = await params;

  const task = await getQueryClient()
    .fetchQuery(trpc.task.byId.queryOptions({ id }))
    .catch((error: unknown) => {
      // Id inexistente ou mal formado → página 404; outros erros vão para `error.tsx`.
      const code = error instanceof TRPCClientError ? error.data?.code : undefined;
      if (code === "NOT_FOUND" || code === "BAD_REQUEST") notFound();
      throw error;
    });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Editar tarefa</h1>
      <TaskForm task={task} />
    </main>
  );
}
