"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Não foi possível carregar esta página. Verifique se o backend está rodando e tente novamente.
      </p>
      <div className="flex gap-2">
        <button onClick={() => retry()} className={buttonStyles("primary")}>
          Tentar novamente
        </button>
        <Link href="/" className={buttonStyles("secondary")}>
          Voltar para a lista
        </Link>
      </div>
    </main>
  );
}
