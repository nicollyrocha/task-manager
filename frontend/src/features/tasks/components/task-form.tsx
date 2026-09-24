"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage, getFieldErrors } from "@/lib/trpc/errors";
import { useCreateTask, useUpdateTask } from "../hooks/use-task-mutations";
import type { Task } from "../types";
import { type TaskFormErrors, type TaskFormValues, validateTask } from "../validation";

const inputStyles =
  "w-full rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 aria-invalid:border-red-500 aria-invalid:focus:ring-red-300 border-zinc-300 dark:border-zinc-700";

interface TaskFormProps {
  /** Tarefa a editar; sem ela o formulário cria uma nova. */
  task?: Task;
}

export function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateTask();
  const update = useUpdateTask();
  const mutation = task ? update : create;

  const [values, setValues] = useState<TaskFormValues>({
    titulo: task?.titulo ?? "",
    descricao: task?.descricao ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const tituloRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLTextAreaElement>(null);

  // Erros do frontend aparecem após a primeira tentativa de envio; os do backend, até o campo ser editado.
  const clientErrors = validateTask(values);
  const errors: TaskFormErrors = {
    titulo: (submitted ? clientErrors.titulo : undefined) ?? serverErrors.titulo,
    descricao: (submitted ? clientErrors.descricao : undefined) ?? serverErrors.descricao,
  };

  // Continua travado após o sucesso, enquanto redireciona para a listagem.
  const busy = mutation.isPending || mutation.isSuccess;

  function handleChange(field: keyof TaskFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSuccess() {
    toast.success(task ? "Tarefa atualizada com sucesso." : "Tarefa criada com sucesso.");
    router.push("/");
  }

  function handleError(error: unknown) {
    setServerErrors(getFieldErrors(error));
    setFormError(getErrorMessage(error));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (clientErrors.titulo) return tituloRef.current?.focus();
    if (clientErrors.descricao) return descricaoRef.current?.focus();

    const titulo = values.titulo.trim();
    const descricao = values.descricao.trim();
    const callbacks = { onSuccess: handleSuccess, onError: handleError };

    if (task) {
      update.mutate({ id: task.id, titulo, descricao: descricao || null }, callbacks);
    } else {
      create.mutate({ titulo, descricao: descricao || undefined }, callbacks);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título <span className="text-red-600">*</span>
        </label>
        <input
          ref={tituloRef}
          id="titulo"
          value={values.titulo}
          onChange={(e) => handleChange("titulo", e.target.value)}
          placeholder="Ex.: Estudar tRPC"
          disabled={busy}
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={errors.titulo ? "titulo-erro" : undefined}
          className={inputStyles}
        />
        {errors.titulo && (
          <p id="titulo-erro" className="text-sm text-red-600">
            {errors.titulo}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição <span className="font-normal text-zinc-500">(opcional)</span>
        </label>
        <textarea
          ref={descricaoRef}
          id="descricao"
          value={values.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
          rows={4}
          disabled={busy}
          aria-invalid={Boolean(errors.descricao)}
          aria-describedby={errors.descricao ? "descricao-erro" : undefined}
          className={inputStyles}
        />
        {errors.descricao && (
          <p id="descricao-erro" className="text-sm text-red-600">
            {errors.descricao}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Link href="/" className={buttonStyles("secondary")}>
          Cancelar
        </Link>
        <button type="submit" disabled={busy} className={buttonStyles("primary")}>
          {mutation.isPending ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
