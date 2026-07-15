import Link from "next/link";
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
  /** Label for the reset chip. Defaults to "All". */
  allLabel?: string;
  options: FilterOption[];
};

/**
 * URL-driven filter chips (server component — no client JS). Each chip is a
 * <Link> that toggles one param while preserving the others and resetting
 * pagination, so multiple groups combine cleanly and every filtered view is
 * shareable/SSR-rendered. Editorial chip look (ink/bone, mono caps).
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
    <div className="space-y-4">
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
  );
}
