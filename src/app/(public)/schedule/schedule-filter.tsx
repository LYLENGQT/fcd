"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function ScheduleFilter({
  sports,
  active,
}: {
  sports: string[];
  active?: string;
}) {
  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      key={label}
      href={href}
      className={cn(
        "border px-3.5 py-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors",
        isActive
          ? "border-ink bg-ink text-bone"
          : "border-ink/20 text-ink/70 hover:border-ink hover:text-ink"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {chip("All Sports", "/schedule", !active)}
      {sports.map((s) =>
        chip(s, `/schedule?sport=${encodeURIComponent(s)}`, active === s)
      )}
    </div>
  );
}
