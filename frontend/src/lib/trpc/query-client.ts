import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Uma nova tentativa só: com o backend fora do ar, o erro aparece rápido em vez de após várias.
      queries: { staleTime: 30_000, retry: 1 },
      // O estado pré-carregado no servidor passa por superjson para manter `Date` (ex.: `dataCriacao`).
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });
}
