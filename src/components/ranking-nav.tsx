import Link from "next/link";
import { Fragment } from "react";

type RankingView = "tally" | "standings" | "breakdown";

const VIEWS: { id: RankingView; href: string; label: string }[] = [
  { id: "tally", href: "/tally", label: "Tally" },
  { id: "standings", href: "/standings", label: "Standings" },
  { id: "breakdown", href: "/tally/breakdown", label: "Breakdown" },
];

/**
 * Compact ranking view-switcher for the PageHeader eyebrow row. The current
 * view is gold; the siblings are links. Rendered on the dark masthead, so it
 * uses on-inv tokens.
 */
export function RankingNav({ current }: { current: RankingView }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-data text-[11px] uppercase tracking-[0.2em]">
      {VIEWS.map((v, i) => (
        <Fragment key={v.id}>
          {i > 0 && (
            <span className="text-on-inv/25" aria-hidden>
              ·
            </span>
          )}
          {v.id === current ? (
            <span className="text-gold" aria-current="page">
              {v.label}
            </span>
          ) : (
            <Link
              href={v.href}
              className="text-on-inv/55 transition-colors hover:text-on-inv"
            >
              {v.label}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
