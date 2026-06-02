import Link from "next/link";

/** Shown when Supabase env vars are missing, so the app boots cleanly during
 *  first-time setup instead of throwing. */
export function EnvNotice() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-xl border border-ink/20 bg-bone p-10">
        <div className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-crimson">
          Setup Required
        </div>
        <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-tight">
          Awaiting Connection
        </h2>
        <p className="mt-4 font-editorial text-lg leading-relaxed text-ink/75">
          Supabase environment variables are not configured. Copy{" "}
          <code className="bg-ink/5 px-1 font-mono-data text-sm">.env.example</code>{" "}
          to{" "}
          <code className="bg-ink/5 px-1 font-mono-data text-sm">.env.local</code>,
          fill in your Supabase project URL and keys, run the migrations in{" "}
          <code className="bg-ink/5 px-1 font-mono-data text-sm">
            supabase/migrations
          </code>
          , then{" "}
          <code className="bg-ink/5 px-1 font-mono-data text-sm">npm run seed</code>.
        </p>
        <p className="mt-6 font-mono-data text-[11px] uppercase tracking-[0.2em]">
          <Link
            href="/"
            className="text-gold-deep underline underline-offset-4 hover:text-ink"
          >
            See STATUS.md for full instructions →
          </Link>
        </p>
      </div>
    </div>
  );
}
