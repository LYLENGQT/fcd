"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the console; wire an error tracker (e.g. Sentry) here if added.
    console.error(error);
  }, [error]);

  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/50">
        Error · Coverage interrupted
      </p>
      <h1 className="mt-4 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
        A wrinkle in the
        <br />
        <span className="text-gold">coverage</span>
      </h1>
      <p className="mt-5 max-w-md font-editorial text-lg italic text-ink/65">
        This page hit an unexpected error. It may be temporary — try again, or
        head back to the front page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-bone transition hover:bg-ink/85"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-ink/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-ink transition hover:border-ink"
        >
          Front page
        </Link>
      </div>
    </section>
  );
}
