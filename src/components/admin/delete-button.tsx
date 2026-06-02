"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/** Generic delete control styled as an editorial mono link. Pass a bound server
 *  action, e.g. `action={deleteThing.bind(null, id)}`. */
export function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Delete this item?",
}: {
  action: () => Promise<{ ok: boolean; error?: string } | void>;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/50 underline-offset-4 transition-colors hover:text-crimson hover:underline disabled:opacity-50"
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          const res = await action();
          if (res && "ok" in res && !res.ok) {
            window.alert(res.error ?? "Delete failed");
            return;
          }
          router.refresh();
        });
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}
