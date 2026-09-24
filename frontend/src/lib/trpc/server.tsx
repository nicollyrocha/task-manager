import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "backend/router";
import { cache } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import { TRPC_URL } from "./url";

/** Um QueryClient por requisição, compartilhado entre os Server Components dela. */
export const getQueryClient = cache(makeQueryClient);

/** Proxy tRPC para Server Components: pré-carrega dados durante o SSR. */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [httpLink({ url: TRPC_URL, transformer: superjson })],
  }),
  queryClient: getQueryClient,
});

/** Envia para o cliente os dados pré-carregados no servidor. */
export function HydrateClient({ children }: { children: React.ReactNode }) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}
