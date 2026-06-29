"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/50">
        Admin · Something went wrong
      </p>
      <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
        This screen hit an <span className="text-gold">error</span>
      </h1>
      <p className="mt-4 max-w-md font-editorial text-base italic text-ink/65">
        Your changes were not lost on the server. Retry the action; if it keeps
        happening, reload the page or sign in again.
      </p>
      {error?.digest && (
        <p className="mt-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
          Ref: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 bg-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-bone transition hover:bg-ink/85"
      >
        Try again
      </button>
    </div>
  );
}
