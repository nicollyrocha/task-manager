import { publicProcedure, router } from "../../trpc/trpc.js";
import { createTaskInput, taskIdInput, updateTaskInput } from "./task.schema.js";

export const taskRouter = router({
  list: publicProcedure.query(({ ctx }) => ctx.taskService.list()),

  byId: publicProcedure
    .input(taskIdInput)
    .query(({ ctx, input }) => ctx.taskService.getById(input.id)),

  create: publicProcedure
    .input(createTaskInput)
    .mutation(({ ctx, input }) => ctx.taskService.create(input)),

  update: publicProcedure
    .input(updateTaskInput)
    .mutation(({ ctx, input }) => ctx.taskService.update(input)),

  delete: publicProcedure
    .input(taskIdInput)
    .mutation(({ ctx, input }) => ctx.taskService.delete(input.id)),
});
