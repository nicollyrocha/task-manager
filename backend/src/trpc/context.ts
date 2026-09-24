import { InMemoryTaskRepository } from "../modules/task/task.repository.js";
import { TaskService } from "../modules/task/task.service.js";

export interface Context {
  taskService: TaskService;
}

const taskService = new TaskService(new InMemoryTaskRepository());

export function createContext(): Context {
  return { taskService };
}
