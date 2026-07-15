"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/admin/toast";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Reusable admin create/edit form. Render the field inputs as children; pass a
 *  server action that returns ActionResult.
 *  - Create mode (default): resets the form + refreshes on success.
 *  - Edit mode: pass `redirectTo` (and usually `resetOnSuccess={false}`) to send
 *    the user back to the list after a successful update. */
export function EntityForm({
  action,
  submitLabel = "Save",
  successMessage = "Saved",
  resetOnSuccess = true,
  redirectTo,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          const res = await action(formData);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setError(null);
          toast(successMessage);
          if (resetOnSuccess) formRef.current?.reset();
          if (redirectTo) {
            router.push(redirectTo);
          }
          router.refresh();
        })
      }
      className="space-y-5"
    >
      {children}
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="border border-crimson/40 bg-crimson/10 px-3 py-2 font-mono-data text-xs uppercase tracking-[0.15em] text-crimson"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-base font-bold uppercase tracking-wider text-bone transition hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
