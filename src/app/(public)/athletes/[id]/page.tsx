import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteAvatar } from "@/components/athlete-avatar";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalTag, MedalCounts } from "@/components/medals";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { MedalKind } from "@/lib/database.types";

export const revalidate = 60;

type AthleteDetail = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  level: string | null;
  photo_url: string | null;
  delegations: { name: string; slug: string; color: string } | null;
  schools: { name: string } | null;
};

async function getAthlete(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("athletes")
    .select(
      "id, first_name, last_name, gender, level, photo_url, delegations(name, slug, color), schools(name)"
    )
    .eq("id", id)
    .single();
  return data as unknown as AthleteDetail | null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const a = await getAthlete(params.id);
  return {
    title: a ? `${a.first_name} ${a.last_name}` : "Athlete",
  };
}

type ResultRow = {
  id: string;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  events: { id: string; name: string; sports: { name: string } | null } | null;
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

export default async function AthleteDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const athlete = await getAthlete(params.id);
  if (!athlete) notFound();

  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);

  const supabase = createClient();
  const { data: resultsData, count } = await supabase
    .from("results")
    .select("id, placement, medal, mark, events(id, name, sports(name))", {
      count: "exact",
    })
    .eq("athlete_id", athlete.id)
    .order("placement")
    .range(from, to);

  // Full, unpaginated medal haul — derive aside stats from this, never the slice.
  const { data: medalData } = await supabase
    .from("results")
    .select("medal")
    .eq("athlete_id", athlete.id);
  const medals = (medalData ?? []) as { medal: MedalKind }[];
  const gold = medals.filter((m) => m.medal === "gold").length;
  const silver = medals.filter((m) => m.medal === "silver").length;
  const bronze = medals.filter((m) => m.medal === "bronze").length;
  const podiums = gold + silver + bronze;

  const results = (resultsData ?? []) as unknown as ResultRow[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        accent={athlete.delegations?.color}
        back={{ href: "/athletes", label: "All Athletes" }}
        eyebrow={`${athlete.level ?? ""} ${athlete.gender}`.trim().toUpperCase()}
        title={
          <span className="flex items-center gap-5">
            <AthleteAvatar
              firstName={athlete.first_name}
              lastName={athlete.last_name}
              photoUrl={athlete.photo_url}
              color={athlete.delegations?.color}
              className="h-16 w-16 text-xl ring-2 ring-on-inv/20 md:h-24 md:w-24 md:text-3xl"
            />
            <span>
              {athlete.first_name}
              <br />
              <span className="text-gold">{athlete.last_name}</span>
            </span>
          </span>
        }
        intro={
          <>
            {athlete.delegations ? (
              <Link
                href={`/delegations/${athlete.delegations.slug}`}
                className="text-on-inv underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
              >
                {athlete.delegations.name}
              </Link>
            ) : (
              "Unaffiliated"
            )}
            {athlete.schools ? ` · ${athlete.schools.name}` : ""}
          </>
        }
        aside={
          <div className="space-y-px">
            <dl className="grid grid-cols-3 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10">
              {[
                { k: "Events", v: total },
                { k: "Podiums", v: podiums },
                { k: "Golds", v: gold },
              ].map((s) => (
                <div key={s.k} className="bg-surface-inv px-4 py-5 text-center">
                  <dt className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-on-inv/55">
                    {s.k}
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-black text-on-inv">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
            {podiums > 0 && (
              <div className="flex items-center justify-between gap-4 border border-on-inv/15 bg-on-inv/10 px-4 py-3">
                <span className="font-mono-data text-[10px] uppercase tracking-[0.16em] text-on-inv/55">
                  Medal Haul
                </span>
                <MedalCounts gold={gold} silver={silver} bronze={bronze} className="text-on-inv" />
              </div>
            )}
          </div>
        }
      />

      <section className="container py-14 md:py-20">
        <header className="flex items-end justify-between border-b-2 border-ink pb-3">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-4xl">
            Results
          </h2>
          <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
            {total} entr{total === 1 ? "y" : "ies"}
          </span>
        </header>

        {results.length === 0 ? (
          <p className="py-12 text-center font-editorial text-xl italic text-ink/45">
            No results recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink/12">
            <li className="grid grid-cols-12 items-baseline gap-x-4 border-b border-ink/15 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
              <div className="col-span-12 md:col-span-6">Event / Sport</div>
              <div className="col-span-4 md:col-span-2">Place</div>
              <div className="col-span-4 md:col-span-2">Mark</div>
              <div className="col-span-4 justify-self-end md:col-span-2">Medal</div>
            </li>
            {results.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-5 transition-colors hover:bg-ink/[0.04]"
              >
                <div className="col-span-12 md:col-span-6">
                  {r.events?.id ? (
                    <Link
                      href={`/results/${r.events.id}`}
                      className="group/event inline-block"
                    >
                      <div className="font-display text-xl font-bold uppercase leading-tight tracking-wide transition-colors group-hover/event:text-gold-deep">
                        {r.events.name}
                      </div>
                      <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                        {r.events.sports?.name}
                        <span className="ml-2 text-ink/0 transition-colors group-hover/event:text-gold-deep">
                          View event →
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div className="font-display text-xl font-bold uppercase leading-tight tracking-wide">
                        {r.events?.name}
                      </div>
                      <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                        {r.events?.sports?.name}
                      </div>
                    </>
                  )}
                </div>
                <div className="col-span-4 font-mono-data text-sm tabular-nums text-ink/70 md:col-span-2">
                  {ordinal(r.placement)}
                </div>
                <div className="col-span-4 font-mono-data text-sm tabular-nums text-ink/70 md:col-span-2">
                  {r.mark ?? "—"}
                </div>
                <div className="col-span-4 justify-self-end md:col-span-2">
                  <MedalTag medal={r.medal} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath={`/athletes/${params.id}`}
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
