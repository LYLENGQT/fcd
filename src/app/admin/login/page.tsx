import Link from "next/link";
import Image from "next/image";
import { MEET_TAGLINE } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin Login" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  const redirectTo = searchParams.redirectTo ?? "/admin";

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ── Left: editorial masthead panel ───────────────────────────── */}
      <section className="relative isolate hidden flex-col justify-between overflow-hidden bg-surface-inv text-on-inv grain spotlight lg:flex">
        {/* Decorative sun-ray ring */}
        <svg
          aria-hidden
          viewBox="0 0 600 600"
          className="spin-slow pointer-events-none absolute -left-40 top-1/3 h-[680px] w-[680px] opacity-[0.16]"
        >
          <defs>
            <radialGradient id="loginRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(41 73% 56%)" stopOpacity="0" />
              <stop offset="70%" stopColor="hsl(41 73% 56%)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(41 73% 56%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="300"
              y1="300"
              x2="300"
              y2="20"
              stroke="url(#loginRing)"
              strokeWidth="2"
              transform={`rotate(${(i * 360) / 24} 300 300)`}
            />
          ))}
          <circle cx="300" cy="300" r="180" fill="none" stroke="hsl(168 78% 44% / 0.45)" strokeWidth="1" />
          <circle cx="300" cy="300" r="240" fill="none" stroke="hsl(168 78% 44% / 0.28)" strokeWidth="1" />
        </svg>

        {/* Ticker */}
        <div className="relative z-10 border-b border-on-inv/10">
          <div className="flex h-9 items-center justify-between px-10 font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/60 xl:px-16">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              FCDSA · 14&ndash;28 OCT 2026 · PHILIPPINES
            </span>
            <span className="hidden xl:inline">Access Restricted</span>
          </div>
        </div>

        {/* Headline block */}
        <div className="relative z-10 px-10 pb-4 xl:px-16">
          <div className="rise flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/60">
            <span className="h-px w-10 bg-gold" />
            Credentialed Access
          </div>
          <h1
            className="rise mt-6 font-display font-black uppercase leading-[0.82] tracking-tight"
            style={{ animationDelay: "60ms" }}
          >
            <span className="block text-[clamp(3rem,7vw,6.5rem)] text-on-inv">
              Control
            </span>
            <span className="block text-[clamp(3rem,7vw,6.5rem)] text-gold drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
              Desk
            </span>
          </h1>
          <p
            className="rise mt-7 max-w-md font-editorial text-lg italic leading-relaxed text-on-inv/75"
            style={{ animationDelay: "150ms" }}
          >
            &ldquo;{MEET_TAGLINE}&rdquo; — the encoders&rsquo; entrance. Results,
            schedule, and the medal tally are managed from here.
          </p>
        </div>

        {/* Footer rule */}
        <div className="relative z-10 border-t border-on-inv/10">
          <div className="flex h-12 items-center justify-between px-10 font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/45 xl:px-16">
            <span>Vol. XXVI · The Meet Bulletin</span>
            <span>Staff Only</span>
          </div>
        </div>
      </section>

      {/* ── Right: credential form ───────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col bg-bone text-ink">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/55 transition-colors hover:text-gold-deep"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
            Back to site
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-20 sm:px-10">
          <div className="rise w-full max-w-sm" style={{ animationDelay: "100ms" }}>
            {/* Meet logo, framed as a clean white badge (consistent with the
                header/footer marks; avoids blend artifacts on the bone panel). */}
            <div className="mb-8 inline-flex rounded-lg bg-white p-3 shadow-sm ring-1 ring-ink/10">
              <Image
                src="/logo.jpg"
                alt="FCDSA Meet Guimbal 2026"
                width={1366}
                height={2049}
                priority
                className="h-24 w-auto"
              />
            </div>

            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
              <span className="h-px w-8 bg-gold-deep" />
              Administrator Sign-in
            </div>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 font-editorial text-base italic text-ink/60">
              Enter your credentials to continue.
            </p>

            <div className="mt-8">
              <LoginForm redirectTo={redirectTo} />
            </div>

            <p className="mt-8 border-t border-ink/10 pt-5 font-mono-data text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ink/45">
              Authorized personnel only. Access is logged.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
