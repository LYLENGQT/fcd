import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MedalTallyRow } from "@/lib/database.types";

const MEDAL_DOT: Record<"gold" | "silver" | "bronze", string> = {
  gold: "bg-[hsl(41,73%,56%)]",
  silver: "bg-[hsl(220,8%,72%)]",
  bronze: "bg-[hsl(24,55%,48%)]",
};

const RANK_ACCENT: Record<number, string> = {
  1: "text-gold",
  2: "text-[hsl(220,8%,55%)]",
  3: "text-[hsl(24,55%,42%)]",
};

export function TallyTable({
  rows,
  linkDelegations = false,
}: {
  rows: MedalTallyRow[];
  linkDelegations?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
        The board awaits its first medal.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-on-inv/15 bg-surface-inv text-on-inv">
            <th className="px-4 py-3 text-left font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70">
              Rank
            </th>
            <th className="px-4 py-3 text-left font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70">
              Delegation
            </th>
            <th className="px-3 py-3 text-center font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70">
              Gold
            </th>
            <th className="px-3 py-3 text-center font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70">
              Silver
            </th>
            <th className="px-3 py-3 text-center font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70">
              Bronze
            </th>
            <th className="px-4 py-3 text-right font-mono-data text-[10px] uppercase tracking-[0.22em] text-gold">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/12">
          {rows.map((r) => {
            const name = (
              <span className="flex items-center gap-3">
                <span
                  className="inline-block h-4 w-4 rounded-sm ring-2 ring-ink/15"
                  style={{ backgroundColor: r.color }}
                  aria-hidden
                />
                <span className="font-display text-xl font-bold uppercase tracking-wide leading-none">
                  {r.delegation_name}
                </span>
                <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
                  {r.abbrev}
                </span>
              </span>
            );

            return (
              <tr
                key={r.delegation_id}
                className="group bg-bone transition-colors hover:bg-ink/[0.04]"
              >
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "font-display text-3xl font-black leading-none",
                      RANK_ACCENT[r.rank] ?? "text-ink/80"
                    )}
                  >
                    {String(r.rank).padStart(2, "0")}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {linkDelegations ? (
                    <Link
                      href={`/delegations/${r.slug}`}
                      className="inline-block transition-colors hover:text-gold-deep"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </td>
                <MedalCell value={r.gold} tone="gold" />
                <MedalCell value={r.silver} tone="silver" />
                <MedalCell value={r.bronze} tone="bronze" />
                <td className="px-4 py-4 text-right">
                  <span className="font-display text-3xl font-black leading-none">
                    {r.total}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MedalCell({
  value,
  tone,
}: {
  value: number;
  tone: "gold" | "silver" | "bronze";
}) {
  return (
    <td className="px-3 py-4 text-center">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("inline-block h-2 w-2 rounded-full", MEDAL_DOT[tone])} />
        <span
          className={cn(
            "font-mono-data text-lg font-medium tabular-nums",
            value === 0 ? "text-ink/30" : "text-ink"
          )}
        >
          {value}
        </span>
      </span>
    </td>
  );
}
