import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial masthead for interior pages — a compact dark-ink band that mirrors
 * the home hero: mono eyebrow, oversized display title, optional italic intro,
 * and an optional right-aligned slot for stats / live status.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  aside,
  back,
  accent,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  /** @deprecated Superseded by the rising-sun motif; accepted for back-compat
   *  but no longer rendered. (Same for `watermark`.) */
  index?: string;
  watermark?: string;
  /** Optional back link shown above the eyebrow. */
  back?: { href: string; label: string };
  /** Optional accent color (e.g. a delegation color) for the left rule + swatch. */
  accent?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-on-inv/10 bg-surface-inv text-on-inv grain">
      <div className="spotlight pointer-events-none absolute inset-0 opacity-70" />

      {/* "Town of the Rising Sun" motif — faint sunburst + concentric rings,
         bleeding off the top-right. Abstract brand texture, not a text repeat. */}
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="pointer-events-none absolute -right-28 -top-44 h-[460px] w-[460px] md:-right-20 md:h-[620px] md:w-[620px]"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={i}
            x1="300"
            y1="300"
            x2="300"
            y2="36"
            stroke="hsl(var(--on-inv))"
            strokeOpacity={0.07}
            strokeWidth="2"
            transform={`rotate(${(i * 360) / 18} 300 300)`}
          />
        ))}
        <circle cx="300" cy="300" r="150" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.22" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="212" fill="none" stroke="hsl(var(--cyan))" strokeOpacity="0.20" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="274" fill="none" stroke="hsl(var(--on-inv))" strokeOpacity="0.06" strokeWidth="1" />
      </svg>

      <div className="container relative z-10 grid grid-cols-12 items-end gap-y-8 py-14 md:py-20">
        <div className="col-span-12 lg:col-span-8">
          {back && (
            <div className="rise mb-6">
              <BackLink href={back.href}>{back.label}</BackLink>
            </div>
          )}
          <div className="rise flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
            <span
              className={cn("h-px w-10", !accent && "bg-gold")}
              style={accent ? { backgroundColor: accent } : undefined}
            />
            {eyebrow}
          </div>

          <h1
            className="rise mt-5 font-display font-black uppercase leading-[0.85] tracking-tight text-[clamp(2.75rem,7vw,5.75rem)]"
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>

          {intro && (
            <p
              className="rise mt-5 max-w-xl font-editorial text-lg italic leading-relaxed text-on-inv/75"
              style={{ animationDelay: "150ms" }}
            >
              {intro}
            </p>
          )}
        </div>

        {aside && (
          <div
            className="rise col-span-12 lg:col-span-4 lg:justify-self-end"
            style={{ animationDelay: "220ms" }}
          >
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

/** A back-link rendered as a mono ticket label, for detail pages. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-on-inv/60 transition-colors hover:text-gold"
    >
      <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
      {children}
    </Link>
  );
}
