"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/trpc/errors";
import { useTRPC } from "@/lib/trpc/client";

/** Marca como desatualizadas todas as queries de tarefas (lista e detalhes). */
function useInvalidateTasks() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: trpc.task.pathKey() });
}

export function useCreateTask() {
  const trpc = useTRPC();
  const invalidateTasks = useInvalidateTasks();
  return useMutation(trpc.task.create.mutationOptions({ onSuccess: invalidateTasks }));
}

export function useUpdateTask() {
  const trpc = useTRPC();
  const invalidateTasks = useInvalidateTasks();
  return useMutation(trpc.task.update.mutationOptions({ onSuccess: invalidateTasks }));
}

export function useDeleteTask() {
  const trpc = useTRPC();
  const toast = useToast();
  const invalidateTasks = useInvalidateTasks();

  // O feedback fica nas opções do hook (e não no `mutate`) porque o item some da tela ao ser excluído.
  return useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await invalidateTasks();
        toast.success("Tarefa excluída com sucesso.");
      },
      onError: (error) => {
        toast.error(`Não foi possível excluir a tarefa: ${getErrorMessage(error)}`);
        // A lista pode estar desatualizada (ex.: a tarefa já tinha sido excluída em outra aba).
        void invalidateTasks();
      },
    }),
  );
}
