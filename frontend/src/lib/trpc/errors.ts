import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "backend/router";

const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";

function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

/** Converte qualquer erro de uma chamada tRPC em uma mensagem para o usuário. */
export function getErrorMessage(error: unknown) {
  if (isTRPCClientError(error)) {
    // Sem `data` a requisição nem chegou a uma resposta do tRPC (servidor fora do ar, rede, CORS...).
    return error.data ? error.message : NETWORK_ERROR_MESSAGE;
  }
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado.";
}

/** Erros de validação do backend por campo (primeira mensagem de cada um). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isTRPCClientError(error)) return {};

  const fieldErrors: Record<string, string[] | undefined> = error.data?.zodError?.fieldErrors ?? {};
  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([field, messages]) => (messages?.[0] ? [[field, messages[0]]] : [])),
  );
}
