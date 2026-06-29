import { cn } from "@/lib/utils";
import type { MedalKind } from "@/lib/database.types";

const DOT: Record<"gold" | "silver" | "bronze", string> = {
  gold: "bg-gold",
  silver: "bg-silver",
  bronze: "bg-bronze",
};

/** Compact gold/silver/bronze counts with colored dots. */
export function MedalCounts({
  gold,
  silver,
  bronze,
  className,
}: {
  gold: number;
  silver: number;
  bronze: number;
  className?: string;
}) {
  const items: Array<["gold" | "silver" | "bronze", number]> = [
    ["gold", gold],
    ["silver", silver],
    ["bronze", bronze],
  ];
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {items.map(([tone, value]) => (
        <span key={tone} className="inline-flex items-center gap-1.5">
          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", DOT[tone])} />
          <span className="font-mono-data text-base font-medium tabular-nums">
            {value}
          </span>
        </span>
      ))}
    </div>
  );
}

/** A single medal label chip used on result rows. */
export function MedalTag({ medal }: { medal: MedalKind }) {
  if (medal === "none") {
    return (
      <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/40">
        —
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em]">
      <span className={cn("inline-block h-2.5 w-2.5 rounded-full", DOT[medal])} />
      {medal}
    </span>
  );
}
