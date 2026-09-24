import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { TaskRepository } from "./task.repository.js";
import type { CreateTaskInput, Task, UpdateTaskInput } from "./task.schema.js";

function taskNotFound(id: string) {
  return new TRPCError({ code: "NOT_FOUND", message: `Tarefa com id "${id}" não encontrada` });
}

/** Descrição vazia é armazenada como `null`. */
function normalizeDescricao(descricao: string | null | undefined) {
  return descricao ? descricao : null;
}

export class TaskService {
  private readonly repository: TaskRepository;

  constructor(repository: TaskRepository) {
    this.repository = repository;
  }

  /** Tarefas mais recentes primeiro. */
  async list() {
    const tasks = await this.repository.list();
    return tasks.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
  }

  async getById(id: string) {
    const task = await this.repository.findById(id);
    if (!task) throw taskNotFound(id);
    return task;
  }

  async create(input: CreateTaskInput) {
    const task: Task = {
      id: randomUUID(),
      titulo: input.titulo,
      descricao: normalizeDescricao(input.descricao),
      dataCriacao: new Date(),
    };
    return this.repository.save(task);
  }

  async update({ id, titulo, descricao }: UpdateTaskInput) {
    const current = await this.getById(id);
    return this.repository.save({
      ...current,
      titulo: titulo ?? current.titulo,
      descricao: descricao === undefined ? current.descricao : normalizeDescricao(descricao),
    });
  }

  async delete(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw taskNotFound(id);
    return { id };
  }
}
