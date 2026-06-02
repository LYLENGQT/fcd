"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "./actions";

const FIELD =
  "h-11 rounded-none border-ink/25 bg-bone text-ink placeholder:text-ink/35 focus-visible:ring-gold-deep";
const LABEL =
  "block font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/60";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wider text-ink transition hover:bg-gold-deep disabled:opacity-50"
    >
      {pending ? "Signing in…" : "Sign in"}
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-1.5">
        <label htmlFor="email" className={LABEL}>
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@fcdsa2026.ph"
          className={FIELD}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={LABEL}>
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={FIELD}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="border border-crimson/40 bg-crimson/10 px-3 py-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-crimson"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
