import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Não encontrado</h1>
      <p className="text-zinc-600 dark:text-zinc-400">A tarefa ou página que você procura não existe ou foi excluída.</p>
      <Link href="/" className={buttonStyles("primary")}>
        Voltar para a lista
      </Link>
    </main>
  );
}
