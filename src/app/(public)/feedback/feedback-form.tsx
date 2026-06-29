"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "./actions";

const FIELD =
  "w-full rounded-none border border-ink/25 bg-bone px-3 py-2.5 text-ink placeholder:text-ink/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep focus-visible:border-gold-deep";
const LABEL =
  "mb-1.5 block font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/60";

export function FeedbackForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    const res = await submitFeedback(new FormData(form));
    setPending(false);
    if (res.ok) {
      form.reset();
      setDone(true);
    } else {
      setError(res.error);
    }
  }

  if (done) {
    return (
      <div className="border border-jade/30 bg-jade/5 px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-jade" />
        <h2 className="mt-4 font-display text-2xl font-black uppercase tracking-tight">
          Thank you
        </h2>
        <p className="mt-2 font-editorial text-lg italic text-ink/70">
          Your feedback has reached the organizing committee.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink/70 transition hover:border-ink hover:text-ink"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fb-name" className={LABEL}>
            Name (optional)
          </label>
          <input id="fb-name" name="name" className={FIELD} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="fb-email" className={LABEL}>
            Email (optional)
          </label>
          <input
            id="fb-email"
            name="email"
            type="email"
            className={FIELD}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="fb-subject" className={LABEL}>
          Subject (optional)
        </label>
        <input
          id="fb-subject"
          name="subject"
          className={FIELD}
          placeholder="What is this about?"
        />
      </div>

      <div>
        <label htmlFor="fb-message" className={LABEL}>
          Message
        </label>
        <textarea
          id="fb-message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          aria-invalid={error ? true : undefined}
          className={`${FIELD} min-h-[140px] resize-y leading-relaxed`}
          placeholder="Share your thoughts, suggestions, or concerns…"
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-crimson"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-bone transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          "Sending…"
        ) : (
          <>
            Send feedback <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
