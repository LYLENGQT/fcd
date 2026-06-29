import Link from "next/link";

type RankingView = "tally" | "standings" | "breakdown";

const VIEWS: { id: RankingView; href: string; label: string }[] = [
  { id: "tally", href: "/tally", label: "Medal Tally" },
  { id: "standings", href: "/standings", label: "Standings" },
  { id: "breakdown", href: "/tally/breakdown", label: "Breakdown" },
];

/** Mirrored "See also" cross-link row shared by the three ranking views. */
export function RankingNav({ current }: { current: RankingView }) {
  const others = VIEWS.filter((v) => v.id !== current);
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
      <span className="text-ink/40">See also</span>
      {others.map((v) => (
        <Link
          key={v.id}
          href={v.href}
          className="text-ink/70 transition-colors hover:text-gold-deep"
        >
          {v.label}
        </Link>
      ))}
      <span className="text-ink/35">
        Tally ranks by gold→silver→bronze · Standings by points (5/3/1) ·
        Breakdown by sport &amp; division.
      </span>
    </div>
  );
}
