"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TaskListError } from "./task-list-error";

/** Mostrado quando o SSR não conseguiu buscar a lista; tentar de novo re-renderiza a página no servidor. */
export function TaskListUnavailable({ message }: { message: string }) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  return <TaskListError message={message} onRetry={() => startTransition(() => router.refresh())} retrying={retrying} />;
}
