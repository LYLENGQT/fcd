"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };
type ToastFn = (message: string, kind?: ToastKind) => void;

// Default no-op so components that call useToast outside a provider degrade
// gracefully instead of crashing.
const ToastContext = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

/**
 * Lightweight editorial toast system for the admin. Toasts auto-dismiss after
 * ~4s, stack bottom-right, and announce politely to screen readers. Mounted
 * once in the admin dashboard layout; trigger via `const toast = useToast()`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, kind = "success") => {
      const id = (idRef.current += 1);
      setToasts((list) => [...list, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "rise pointer-events-auto flex items-start gap-2.5 border bg-surface-inv px-4 py-3 text-on-inv shadow-lg shadow-ink/25",
              t.kind === "success" ? "border-jade/50" : "border-crimson/60",
            )}
          >
            {t.kind === "success" ? (
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
            ) : (
              <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
            )}
            <p className="flex-1 font-mono-data text-[11px] uppercase leading-relaxed tracking-[0.12em]">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-on-inv/50 transition-colors hover:text-on-inv"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
