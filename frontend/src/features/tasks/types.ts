import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "backend/router";

export type Task = inferRouterOutputs<AppRouter>["task"]["list"][number];
