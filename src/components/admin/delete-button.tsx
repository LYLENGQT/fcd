"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/admin/toast";

/** Generic delete control styled as an editorial mono link. Opens a branded
 *  confirmation dialog (naming the item when `itemName` is given) instead of the
 *  native window.confirm, and reports the result via toast. Pass a bound server
 *  action, e.g. `action={deleteThing.bind(null, id)}`. */
export function DeleteButton({
  action,
  label = "Delete",
  itemName,
  confirmText,
}: {
  action: () => Promise<{ ok: boolean; error?: string } | void>;
  label?: string;
  itemName?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const prompt =
    confirmText ??
    (itemName
      ? `Delete “${itemName}”? This can’t be undone.`
      : "Delete this item? This can’t be undone.");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirmDelete() {
    startTransition(async () => {
      const res = await action();
      if (res && "ok" in res && !res.ok) {
        toast(res.error ?? "Delete failed", "error");
        return;
      }
      setOpen(false);
      toast(itemName ? `Deleted “${itemName}”` : "Deleted");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/50 underline-offset-4 transition-colors hover:text-crimson hover:underline"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm border border-ink/15 bg-bone p-6 shadow-xl shadow-ink/25"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crimson/10 text-crimson ring-1 ring-crimson/30">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-ink">
                  Confirm delete
                </h2>
                <p className="mt-1 font-editorial text-sm leading-relaxed text-ink/70">
                  {prompt}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                disabled={pending}
                className="border border-ink/25 px-4 py-2 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/70 transition hover:border-ink hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={pending}
                className="bg-crimson px-4 py-2 font-mono-data text-[11px] uppercase tracking-[0.18em] text-bone transition hover:bg-crimson/85 disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
