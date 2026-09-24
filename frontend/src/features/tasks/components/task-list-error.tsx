"use client";

import { buttonStyles } from "@/components/ui/button";

interface TaskListErrorProps {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}

export function TaskListError({ message, onRetry, retrying }: TaskListErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <p>Não foi possível carregar as tarefas. {message}</p>
      <button onClick={onRetry} disabled={retrying} className={buttonStyles("secondary")}>
        {retrying ? "Tentando..." : "Tentar novamente"}
      </button>
    </div>
  );
}
