import { z } from "zod";

export const TITULO_MAX = 200;
export const DESCRICAO_MAX = 2000;

export interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  dataCriacao: Date;
}

const tituloSchema = z
  .string({ error: "O título é obrigatório" })
  .trim()
  .min(1, "O título é obrigatório")
  .max(TITULO_MAX, `O título deve ter no máximo ${TITULO_MAX} caracteres`);

const descricaoSchema = z
  .string({ error: "A descrição deve ser um texto" })
  .trim()
  .max(DESCRICAO_MAX, `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres`);

const idSchema = z.uuid({ error: "ID de tarefa inválido" });

export const createTaskInput = z.object({
  titulo: tituloSchema,
  descricao: descricaoSchema.optional(),
});

export const updateTaskInput = z
  .object({
    id: idSchema,
    titulo: tituloSchema.optional(),
    // `null` (ou string vazia) limpa a descrição; `undefined` mantém a atual.
    descricao: descricaoSchema.nullable().optional(),
  })
  .refine((data) => data.titulo !== undefined || data.descricao !== undefined, {
    error: "Informe ao menos um campo para atualizar",
  });

export const taskIdInput = z.object({ id: idSchema });

export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
