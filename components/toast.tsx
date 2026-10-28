"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; type: "success" | "error"; title: string; description?: string };
type ToastFn = (t: Omit<Toast, "id">) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback<ToastFn>(
    (t) => {
      const id = Date.now() + Math.random();
      setToasts((all) => [...all.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), t.type === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full animate-pop-in items-start gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200 sm:w-[360px]"
          >
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-600" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-error-600" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900">{t.title}</p>
              {t.description && <p className="mt-1 text-sm break-words text-gray-600">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-500" aria-label="Tutup notifikasi">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
