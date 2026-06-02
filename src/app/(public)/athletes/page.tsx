import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import { AthleteSearch } from "./athlete-search";

export const metadata = {
  title: "Athletes",
  description: "Search athletes across all delegations.",
};

export const revalidate = 60;

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  level: string | null;
  delegations: { name: string; abbrev: string; color: string } | null;
};

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const q = (searchParams.q ?? "").trim();
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);

  let query = supabase
    .from("athletes")
    .select(
      "id, first_name, last_name, gender, level, delegations(name, abbrev, color)",
      { count: "exact" },
    )
    .order("last_name")
    .range(from, to);

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const athletes = (data ?? []) as unknown as Row[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Profiles · All Delegations"
        title={
          <>
            The
            <br />
            <span className="text-gold">Athletes</span>
          </>
        }
        intro="The competitors behind the standings. Search by name to find a profile and follow their results."
      />

      <section className="container py-14 md:py-20">
        <AthleteSearch initialQuery={q} />

        <div className="mt-4 font-mono-data text-[11px] uppercase tracking-[0.22em] text-ink/50">
          {q ? `Results for “${q}”` : "Directory"} · {total} athlete
          {total === 1 ? "" : "s"}
        </div>

        {athletes.length === 0 ? (
          <div className="mt-8 border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No athletes found{q ? ` for “${q}”` : ""}.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((a) => (
              <Link
                key={a.id}
                href={`/athletes/${a.id}`}
                className="group flex items-center justify-between gap-3 bg-bone px-5 py-4 transition-colors hover:bg-highlight hover:text-on-highlight"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: a.delegations?.color ?? "#999" }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg font-bold uppercase leading-tight tracking-wide">
                      {a.first_name} {a.last_name}
                    </div>
                    <div className="truncate font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45 group-hover:text-on-highlight/55">
                      {a.delegations?.abbrev}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 font-mono-data text-[10px] uppercase tracking-[0.16em] text-ink/45 group-hover:text-on-highlight/55">
                  {a.level} {a.gender}
                </span>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath="/athletes"
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
