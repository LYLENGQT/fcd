"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = {
  value: string;
  label: string;
  /** Optional color swatch (e.g. a delegation color) shown before the label. */
  swatch?: string | null;
};

export type FilterGroup = {
  /** URL query-param name this group controls, e.g. "sport". */
  key: string;
  /** Short caption shown above the chips, e.g. "Sport". */
  label: string;
  /** Label for the reset option/chip. Defaults to "All". */
  allLabel?: string;
  options: FilterOption[];
};

/**
 * URL-driven filters. Compact <select> dropdowns on mobile (space-saving) and
 * the editorial chip rows on md+ (unchanged desktop look). Both toggle one param
 * while preserving the others and resetting pagination, so every filtered view
 * stays shareable and scroll position is kept.
 */
export function FilterBar({
  groups,
  basePath,
  current,
}: {
  groups: FilterGroup[];
  basePath: string;
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();

  const hrefFor = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    // Preserve every other active param; drop the one we're changing and page.
    for (const [k, v] of Object.entries(current)) {
      if (!v || k === key || k === "page") continue;
      params.set(k, v);
    }
    if (value !== null) params.set(key, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const chip = (
    label: string,
    href: string,
    isActive: boolean,
    swatch?: string | null,
  ) => (
    <Link
      href={href}
      scroll={false}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-2 border px-3.5 py-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors",
        isActive
          ? "border-ink bg-ink text-bone"
          : "border-ink/20 text-ink/70 hover:border-ink hover:text-ink",
      )}
    >
      {swatch ? (
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 shrink-0 rounded-sm ring-1",
            isActive ? "ring-bone/40" : "ring-ink/20",
          )}
          style={{ backgroundColor: swatch }}
          aria-hidden
        />
      ) : null}
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile: compact dropdowns (one per group) */}
      <div className="grid gap-2.5 md:hidden">
        {groups.map((group) => (
          <div key={group.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/45">
              {group.label}
            </span>
            <div className="relative flex-1">
              <select
                aria-label={group.label}
                value={current[group.key] ?? ""}
                onChange={(e) =>
                  router.push(hrefFor(group.key, e.target.value || null), {
                    scroll: false,
                  })
                }
                className="w-full appearance-none rounded-none border border-ink/25 bg-bone py-2 pl-3 pr-9 font-mono-data text-[11px] uppercase tracking-[0.1em] text-ink focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep"
              >
                <option value="">{group.allLabel ?? "All"}</option>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: editorial chip rows */}
      <div className="hidden space-y-4 md:block">
        {groups.map((group) => {
          const active = current[group.key];
          return (
            <div
              key={group.key}
              role="group"
              aria-label={group.label}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="mr-1 font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
                {group.label}
              </span>
              {chip(group.allLabel ?? "All", hrefFor(group.key, null), !active)}
              {group.options.map((opt) =>
                chip(
                  opt.label,
                  hrefFor(group.key, opt.value),
                  active === opt.value,
                  opt.swatch,
                ),
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
