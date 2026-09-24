import type { Task } from "./task.schema.js";

export interface TaskRepository {
  list(): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
}

/**
 * Armazenamento em memória — os dados se perdem ao reiniciar o servidor.
 * Para trocar por um banco, basta outra implementação de `TaskRepository`.
 */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  async list() {
    return [...this.tasks.values()].map((task) => structuredClone(task));
  }

  async findById(id: string) {
    const task = this.tasks.get(id);
    return task && structuredClone(task);
  }

  async save(task: Task) {
    this.tasks.set(task.id, structuredClone(task));
    return structuredClone(task);
  }

  async delete(id: string) {
    return this.tasks.delete(id);
  }
}
