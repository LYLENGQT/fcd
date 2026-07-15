import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalCounts } from "@/components/medals";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import { FilterBar } from "@/components/filter-bar";
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
  searchParams: {
    q?: string;
    page?: string;
    delegation?: string;
    level?: string;
    gender?: string;
  };
}) {
  const supabase = createClient();
  const q = (searchParams.q ?? "").trim();
  const activeDelegation = searchParams.delegation;
  const activeLevel = searchParams.level;
  const activeGender = searchParams.gender;
  const anyFilter = Boolean(q || activeDelegation || activeLevel || activeGender);
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
  if (activeDelegation) query = query.eq("delegation_id", activeDelegation);
  if (activeLevel) query = query.eq("level", activeLevel);
  if (activeGender) query = query.eq("gender", activeGender);

  const { data, count } = await query;
  const athletes = (data ?? []) as unknown as Row[];
  const total = count ?? 0;

  // Per-card medal badges: one read scoped to THIS page's athlete ids, grouped in JS.
  const pageIds = athletes.map((a) => a.id);
  const medalsByAthlete = new Map<
    string,
    { gold: number; silver: number; bronze: number }
  >();
  if (pageIds.length > 0) {
    const { data: medalRows } = await supabase
      .from("results")
      .select("medal, athlete_id")
      .in("athlete_id", pageIds);
    for (const row of (medalRows ?? []) as {
      medal: "gold" | "silver" | "bronze" | "none";
      athlete_id: string;
    }[]) {
      if (row.medal === "none") continue;
      const tally = medalsByAthlete.get(row.athlete_id) ?? {
        gold: 0,
        silver: 0,
        bronze: 0,
      };
      tally[row.medal] += 1;
      medalsByAthlete.set(row.athlete_id, tally);
    }
  }

  // Delegations power the filter chips (abbrev + color) and the directory
  // caption count. One read of a tiny table.
  const { data: delegationRows } = await supabase
    .from("delegations")
    .select("id, abbrev, name, color")
    .order("abbrev");
  const delegationOptions = (
    (delegationRows ?? []) as {
      id: string;
      abbrev: string;
      name: string;
      color: string;
    }[]
  ).map((d) => ({ value: d.id, label: d.abbrev, swatch: d.color }));
  // Only shown on the plain, unfiltered "Directory" caption.
  const delegationCount = anyFilter ? 0 : delegationOptions.length;

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

        <div className="mt-6">
          <FilterBar
            basePath="/athletes"
            current={{
              q: q || undefined,
              delegation: activeDelegation,
              level: activeLevel,
              gender: activeGender,
            }}
            groups={[
              {
                key: "delegation",
                label: "Delegation",
                options: delegationOptions,
              },
              {
                key: "level",
                label: "Level",
                options: [
                  { value: "elementary", label: "Elementary" },
                  { value: "secondary", label: "Secondary" },
                ],
              },
              {
                key: "gender",
                label: "Division",
                options: [
                  { value: "boys", label: "Boys" },
                  { value: "girls", label: "Girls" },
                ],
              },
            ]}
          />
        </div>

        <div className="mt-6 font-mono-data text-[11px] uppercase tracking-[0.22em] text-ink/50">
          {q ? `Results for “${q}”` : "Directory"} · {total} athlete
          {total === 1 ? "" : "s"}
          {delegationCount > 0
            ? ` · across ${delegationCount} delegation${delegationCount === 1 ? "" : "s"}`
            : ""}
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
                className="group flex items-center justify-between gap-3 bg-bone px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-highlight hover:text-on-highlight hover:shadow-md hover:shadow-ink/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-8 w-1 shrink-0 rounded-sm transition-all duration-300 group-hover:scale-y-110"
                    style={{ backgroundColor: a.delegations?.color ?? "hsl(var(--ink) / 0.3)" }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg font-bold uppercase leading-tight tracking-wide">
                      {a.first_name} {a.last_name}
                    </div>
                    <div className="truncate font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45 group-hover:text-on-highlight/55">
                      {a.delegations?.abbrev}
                      {a.delegations?.name ? ` · ${a.delegations.name}` : ""}
                    </div>
                  </div>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-ink/45 group-hover:text-on-highlight/55">
                    {a.level} {a.gender}
                  </span>
                  {(() => {
                    const m = medalsByAthlete.get(a.id);
                    return m ? (
                      <MedalCounts
                        gold={m.gold}
                        silver={m.silver}
                        bronze={m.bronze}
                        className="scale-90 gap-2.5"
                      />
                    ) : null;
                  })()}
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
