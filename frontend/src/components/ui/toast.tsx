"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const TOAST_DURATION_MS = 4000;

const ToastContext = createContext<ToastApi | null>(null);

/** Fica no layout raiz, então as mensagens sobrevivem à navegação entre páginas. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (message) => show("success", message), error: (message) => show("error", message) }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-md ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                : "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
            }`}
          >
            <p className="flex-1 break-words">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} aria-label="Fechar mensagem" className="opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return api;
}
