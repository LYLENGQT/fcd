import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalCounts } from "@/components/medals";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { MedalTallyRow, StandingsRow } from "@/lib/database.types";

export const metadata = {
  title: "Delegations",
  description: "Participating delegations and their medal counts.",
};

export const revalidate = 60;

export default async function DelegationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);

  // Tally view already carries delegation info + medal counts.
  const supabase = createClient();
  const { data, count } = await supabase
    .from("medal_tally")
    .select("*", { count: "exact" })
    .order("rank", { ascending: true })
    .range(from, to);

  const tally = (data ?? []) as MedalTallyRow[];
  const total = count ?? 0;

  // Seals live on the delegations table (not the tally view) — fetch + map.
  const { data: logoRows } = await supabase
    .from("delegations")
    .select("id, logo_url")
    .in(
      "id",
      tally.map((t) => t.delegation_id),
    );
  const logoById = new Map(
    (logoRows ?? []).map((l) => [l.id as string, l.logo_url as string | null]),
  );

  // Championship points live on the standings view, not the tally — fetch ALL
  // rows (tiny) and map points + standings rank onto each delegation by id.
  const { data: standingsRows } = await supabase
    .from("standings")
    .select("delegation_id, points, rank");
  const standingsById = new Map(
    (standingsRows ?? []).map((s) => {
      const row = s as Pick<StandingsRow, "delegation_id" | "points" | "rank">;
      return [row.delegation_id, { points: row.points, rank: row.rank }];
    }),
  );

  return (
    <>
      <PageHeader
        index="03"
        eyebrow="One District · Many Banners"
        title={
          <>
            The
            <br />
            <span className="text-gold">Delegations</span>
          </>
        }
        intro={`${total} schools carry their colors into the arena. Tap a banner for its roster and medal record.`}
      />

      <section className="container py-14 md:py-20">
        {tally.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Delegations will appear here once registered.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {tally.map((d) => {
              const logo = logoById.get(d.delegation_id);
              const standing = standingsById.get(d.delegation_id);
              return (
              <Link
                key={d.delegation_id}
                href={`/delegations/${d.slug}`}
                className="group relative flex flex-col justify-between bg-bone p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-highlight hover:text-on-highlight hover:shadow-xl hover:shadow-ink/15"
              >
                {/* color stripe */}
                <span
                  className="absolute inset-x-0 top-0 h-1 transition-all duration-300 ease-out group-hover:h-1.5"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                />

                <div className="flex items-start justify-between">
                  {logo ? (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bone p-1 ring-2 ring-ink/15 transition-all duration-300 group-hover:scale-110 group-hover:ring-gold/40">
                      <Image
                        src={logo}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  ) : (
                    <span
                      className="inline-block h-9 w-9 rounded-sm ring-2 ring-ink/15 transition-all duration-300 group-hover:scale-110 group-hover:ring-gold/40"
                      style={{ backgroundColor: d.color }}
                      aria-hidden
                    />
                  )}
                  <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink/45 transition-colors duration-300 group-hover:text-on-highlight/55">
                    Rank #{d.rank}
                  </span>
                </div>

                <div className="mt-8">
                  <div className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45 transition-colors duration-300 group-hover:text-on-highlight/55">
                    {d.abbrev}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-tight tracking-tight transition-colors duration-300">
                    {d.delegation_name}
                  </h2>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-ink/12 pt-4 transition-colors duration-300 group-hover:border-on-highlight/15">
                  <MedalCounts gold={d.gold} silver={d.silver} bronze={d.bronze} />
                  <ArrowUpRight aria-hidden className="h-5 w-5 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45 transition-colors duration-300 group-hover:text-on-highlight/55">
                  <span>{d.total} medals</span>
                  {standing ? <span>{standing.points} pts</span> : null}
                  {standing && standing.rank !== d.rank ? (
                    <span>Pts rank #{standing.rank}</span>
                  ) : null}
                </div>
              </Link>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath="/delegations"
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
