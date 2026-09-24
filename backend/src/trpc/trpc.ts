import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create({
  // superjson preserva tipos como `Date` (ex.: `dataCriacao`) entre servidor e cliente.
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;

    return {
      ...shape,
      // Erros de validação viram uma mensagem legível em vez do JSON cru do Zod.
      message: zodError ? zodError.issues.map((issue) => issue.message).join("; ") : shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? z.flattenError(zodError) : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
