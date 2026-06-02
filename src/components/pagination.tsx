import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Editorial, server-rendered pagination. Renders Prev/Next + numbered page
 * links (with ellipsis), preserving any existing search params (filters like
 * `?q` / `?sport`). Hides itself when there's only one page.
 *
 * Drive it from a Server Component:
 *   const page = parsePage(searchParams.page);
 *   const { from, to } = pageRange(page, PAGE_SIZE);
 *   const { data, count } = await supabase.from(t)
 *     .select("...", { count: "exact" }).range(from, to);
 *   <Pagination page={page} totalCount={count ?? 0} pageSize={PAGE_SIZE}
 *              basePath="/admin/athletes" searchParams={searchParams} />
 */
export function Pagination({
  page,
  totalCount,
  pageSize,
  basePath,
  searchParams = {},
  paramName = "page",
  className,
}: {
  page: number;
  totalCount: number;
  pageSize: number;
  basePath: string;
  searchParams?: SearchParams;
  /** Query key for the page number. Override to run two paginations on one
   *  page (e.g. "rpage" + "apage"). */
  paramName?: string;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === paramName || v == null) continue;
      sp.set(k, Array.isArray(v) ? v[0] ?? "" : v);
    }
    if (p > 1) sp.set(paramName, String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const items = pageItems(current, totalPages);

  const numberBase =
    "inline-flex h-9 min-w-9 items-center justify-center px-3 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-10 flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      <Arrow
        direction="prev"
        href={hrefFor(current - 1)}
        disabled={current === 1}
      />

      {items.map((it, i) =>
        it === "ellipsis" ? (
          <span
            key={`gap-${i}`}
            className="px-1 font-mono-data text-[11px] text-ink/35"
            aria-hidden
          >
            &hellip;
          </span>
        ) : it === current ? (
          <span
            key={it}
            aria-current="page"
            className={cn(numberBase, "border border-ink bg-ink text-bone")}
          >
            {it}
          </span>
        ) : (
          <Link
            key={it}
            href={hrefFor(it)}
            scroll={false}
            className={cn(
              numberBase,
              "border border-ink/20 text-ink/70 hover:border-ink hover:text-ink",
            )}
          >
            {it}
          </Link>
        ),
      )}

      <Arrow
        direction="next"
        href={hrefFor(current + 1)}
        disabled={current === totalPages}
      />
    </nav>
  );
}

function Arrow({
  direction,
  href,
  disabled,
}: {
  direction: "prev" | "next";
  href: string;
  disabled: boolean;
}) {
  const isPrev = direction === "prev";
  const label = isPrev ? "Previous page" : "Next page";
  const Icon = isPrev ? ChevronLeft : ChevronRight;
  const base =
    "inline-flex h-9 items-center gap-1 px-3 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(base, "border border-ink/10 text-ink/25")}
      >
        {isPrev && <Icon className="h-3.5 w-3.5" />}
        {isPrev ? "Prev" : "Next"}
        {!isPrev && <Icon className="h-3.5 w-3.5" />}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      scroll={false}
      className={cn(
        base,
        "border border-ink/20 text-ink/70 hover:border-ink hover:text-ink",
      )}
    >
      {isPrev && <Icon className="h-3.5 w-3.5" />}
      {isPrev ? "Prev" : "Next"}
      {!isPrev && <Icon className="h-3.5 w-3.5" />}
    </Link>
  );
}

/** Page-number list with ellipsis: first, last, current ±1. */
function pageItems(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  const out: Array<number | "ellipsis"> = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
      out.push(p);
    } else if (out[out.length - 1] !== "ellipsis") {
      out.push("ellipsis");
    }
  }
  return out;
}
