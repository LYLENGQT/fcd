"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${FIELD} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink/45 transition-colors hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden />
            ) : (
              <Eye className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
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
