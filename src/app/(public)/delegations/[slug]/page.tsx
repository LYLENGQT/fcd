import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalTag, MedalCounts } from "@/components/medals";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type {
  Delegation,
  MedalKind,
  MedalByDelegationSportRow,
} from "@/lib/database.types";

export const revalidate = 60;

type Params = { slug: string };

async function getDelegation(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("delegations")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Delegation | null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const d = await getDelegation(params.slug);
  return { title: d ? d.name : "Delegation" };
}

type ResultRow = {
  id: string;
  event_id: string;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  events: { name: string; sports: { name: string } | null } | null;
  athletes: { first_name: string; last_name: string } | null;
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

export default async function DelegationDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { rpage?: string; apage?: string };
}) {
  const delegation = await getDelegation(params.slug);
  if (!delegation) notFound();

  // Two independent paginations on one page: results (?rpage), roster (?apage).
  const rpage = parsePage(searchParams.rpage);
  const apage = parsePage(searchParams.apage);
  const r = pageRange(rpage, PAGE_SIZE_PUBLIC);
  const a = pageRange(apage, PAGE_SIZE_PUBLIC);

  const supabase = createClient();
  const [
    { data: athletesData, count: athletesCount },
    { data: resultsData, count: resultsCount },
    { data: tallyRow },
    { data: standingRow },
    { data: strengthData },
  ] = await Promise.all([
    supabase
      .from("athletes")
      .select("id, first_name, last_name, gender, level", { count: "exact" })
      .eq("delegation_id", delegation.id)
      .order("last_name")
      .range(a.from, a.to),
    supabase
      .from("results")
      .select(
        "id, event_id, placement, medal, mark, events(name, sports(name)), athletes(first_name, last_name)",
        { count: "exact" },
      )
      .eq("delegation_id", delegation.id)
      .order("placement")
      .order("event_id")
      .range(r.from, r.to),
    supabase
      .from("medal_tally")
      .select("gold, silver, bronze, total, rank")
      .eq("delegation_id", delegation.id)
      .single(),
    supabase
      .from("standings")
      .select("points, rank")
      .eq("delegation_id", delegation.id)
      .single(),
    supabase
      .from("medal_by_delegation_sport")
      .select("sport_name, gold, silver, bronze, total")
      .eq("delegation_id", delegation.id),
  ]);

  const athletes = athletesData ?? [];
  const results = (resultsData ?? []) as unknown as ResultRow[];
  const resultsTotal = resultsCount ?? 0;
  const athletesTotal = athletesCount ?? 0;
  const t = tallyRow as
    | { gold: number; silver: number; bronze: number; total: number; rank: number }
    | null;
  const s = standingRow as { points: number; rank: number } | null;
  const strength = ((strengthData ?? []) as unknown as Array<
    Pick<MedalByDelegationSportRow, "sport_name" | "gold" | "silver" | "bronze" | "total">
  >)
    .slice()
    .sort((x, y) => y.total - x.total);

  return (
    <>
      <PageHeader
        accent={delegation.color}
        back={{ href: "/delegations", label: "All Delegations" }}
        eyebrow={`${delegation.abbrev}${t ? ` · Rank #${t.rank}` : ""}${
          s ? ` · ${s.points} pts · Pts rank #${s.rank}` : ""
        }`}
        title={
          delegation.logo_url ? (
            <span className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-bone p-1.5 ring-2 ring-on-inv/20 md:h-24 md:w-24">
                <Image
                  src={delegation.logo_url}
                  alt={`${delegation.name} seal`}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                />
              </span>
              {delegation.name}
            </span>
          ) : (
            delegation.name
          )
        }
        aside={
          t ? (
            <dl className="grid grid-cols-4 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10 sm:grid-cols-5">
              {[
                { k: "Gold", v: t.gold },
                { k: "Silver", v: t.silver },
                { k: "Bronze", v: t.bronze },
                { k: "Total", v: t.total },
                ...(s ? [{ k: "Points", v: s.points }] : []),
              ].map((stat) => (
                <div key={stat.k} className="bg-surface-inv px-3 py-4 text-center">
                  <dt className="font-mono-data text-[9px] uppercase tracking-[0.16em] text-on-inv/55">
                    {stat.k}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-black text-on-inv">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          ) : undefined
        }
      />

      {strength.length > 0 ? (
        <section className="container pt-14 md:pt-20">
          <header className="flex items-end justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-4xl">
              Strength by Sport
            </h2>
            <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
              {strength.length} sport{strength.length === 1 ? "" : "s"}
            </span>
          </header>
          <ul className="divide-y divide-ink/12">
            {strength.map((sp) => (
              <li
                key={sp.sport_name}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                  {sp.sport_name}
                </div>
                <div className="flex items-center gap-5">
                  <MedalCounts gold={sp.gold} silver={sp.silver} bronze={sp.bronze} />
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                    {sp.total} total
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-5">
        {/* Medals won */}
        <div className="lg:col-span-3">
          <header className="flex items-end justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-4xl">
              Medals Won
            </h2>
            <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
              {resultsTotal} result{resultsTotal === 1 ? "" : "s"}
            </span>
          </header>

          {resultsTotal === 0 ? (
            <p className="py-12 text-center font-editorial text-xl italic text-ink/45">
              No medals recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-ink/12">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/results/${r.event_id}`}
                    className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:bg-ink/[0.04] hover:text-gold-deep"
                  >
                    <div>
                      <div className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                        {r.events?.name}
                      </div>
                      <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                        {r.events?.sports?.name}
                        {r.athletes
                          ? ` · ${r.athletes.first_name} ${r.athletes.last_name}`
                          : " · Team"}
                        {` · ${ordinal(r.placement)}`}
                        {r.mark ? ` · ${r.mark}` : ""}
                      </div>
                    </div>
                    <MedalTag medal={r.medal} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Pagination
            page={rpage}
            totalCount={resultsTotal}
            pageSize={PAGE_SIZE_PUBLIC}
            basePath={`/delegations/${params.slug}`}
            searchParams={searchParams}
            paramName="rpage"
          />
        </div>

        {/* Roster */}
        <div className="lg:col-span-2">
          <header className="flex items-end justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-4xl">
              Roster
            </h2>
            <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
              {athletesTotal}
            </span>
          </header>

          {athletesTotal === 0 ? (
            <p className="py-12 text-center font-editorial text-xl italic text-ink/45">
              No athletes registered yet.
            </p>
          ) : (
            <ul className="divide-y divide-ink/12">
              {athletes.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/athletes/${a.id}`}
                    className="group flex items-center justify-between py-3.5 transition-colors hover:text-gold-deep"
                  >
                    <span className="font-editorial text-lg">
                      {a.first_name} {a.last_name}
                    </span>
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45 group-hover:text-gold-deep">
                      {a.level} {a.gender}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Pagination
            page={apage}
            totalCount={athletesTotal}
            pageSize={PAGE_SIZE_PUBLIC}
            basePath={`/delegations/${params.slug}`}
            searchParams={searchParams}
            paramName="apage"
          />
        </div>
      </section>
    </>
  );
}
