"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { useDeleteTask } from "../hooks/use-task-mutations";
import type { Task } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function TaskItem({ task }: { task: Task }) {
  const remove = useDeleteTask();
  const [confirming, setConfirming] = useState(false);

  return (
    <li
      aria-busy={remove.isPending}
      className={`flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 transition-opacity sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800 ${
        remove.isPending ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <h2 className="font-medium break-words">{task.titulo}</h2>
        {task.descricao && (
          <p className="mt-1 text-sm whitespace-pre-line break-words text-zinc-600 dark:text-zinc-400">{task.descricao}</p>
        )}
        <time dateTime={task.dataCriacao.toISOString()} className="mt-2 block text-xs text-zinc-500">
          Criada em {dateFormatter.format(task.dataCriacao)}
        </time>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {remove.isPending ? (
          <span className="px-3 py-1.5 text-sm text-zinc-500">Excluindo...</span>
        ) : confirming ? (
          <>
            <span className="px-1 text-sm">Excluir?</span>
            <button onClick={() => remove.mutate({ id: task.id }, { onSettled: () => setConfirming(false) })} className={buttonStyles("danger")}>
              Sim
            </button>
            <button onClick={() => setConfirming(false)} className={buttonStyles("secondary")}>
              Não
            </button>
          </>
        ) : (
          <>
            <Link href={`/tarefas/${task.id}/editar`} className={buttonStyles("secondary")}>
              Editar
            </Link>
            <button onClick={() => setConfirming(true)} className={buttonStyles("danger")}>
              Excluir
            </button>
          </>
        )}
      </div>
    </li>
  );
}
