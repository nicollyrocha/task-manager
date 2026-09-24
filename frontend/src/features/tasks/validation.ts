// Mesmas regras do backend (`backend/src/modules/task/task.schema.ts`), checadas antes do envio.
export const TITULO_MAX = 200;
export const DESCRICAO_MAX = 2000;

export interface TaskFormValues {
  titulo: string;
  descricao: string;
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export function validateTask({ titulo, descricao }: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const tituloTrimmed = titulo.trim();

  if (!tituloTrimmed) {
    errors.titulo = "O título é obrigatório";
  } else if (tituloTrimmed.length > TITULO_MAX) {
    errors.titulo = `O título deve ter no máximo ${TITULO_MAX} caracteres`;
  }

  if (descricao.trim().length > DESCRICAO_MAX) {
    errors.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres`;
  }

  return errors;
}
