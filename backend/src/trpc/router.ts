import { taskRouter } from "../modules/task/task.router.js";
import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" as const, timestamp: new Date() })),
  task: taskRouter,
});

/** Tipo consumido pelo frontend (import type) para ter o cliente tRPC tipado. */
export type AppRouter = typeof appRouter;
