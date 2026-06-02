import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalTag } from "@/components/medals";
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
  events: { name: string; sports: { name: string } | null } | null;
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
    .select("id, placement, medal, mark, events(name, sports(name))", {
      count: "exact",
    })
    .eq("athlete_id", athlete.id)
    .order("placement")
    .range(from, to);

  const results = (resultsData ?? []) as unknown as ResultRow[];
  const total = count ?? 0;
  const golds = results.filter((r) => r.medal === "gold").length;
  const podiums = results.filter((r) => r.medal !== "none").length;

  return (
    <>
      <PageHeader
        accent={athlete.delegations?.color}
        back={{ href: "/athletes", label: "All Athletes" }}
        eyebrow={`${athlete.level ?? ""} ${athlete.gender}`.trim().toUpperCase()}
        title={
          <span className="flex items-center gap-5">
            {athlete.photo_url && (
              <Image
                src={athlete.photo_url}
                alt={`${athlete.first_name} ${athlete.last_name}`}
                width={96}
                height={96}
                className="h-16 w-16 shrink-0 rounded-sm object-cover ring-2 ring-on-inv/20 md:h-24 md:w-24"
              />
            )}
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
          <dl className="grid grid-cols-3 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10">
            {[
              { k: "Events", v: total },
              { k: "Podiums", v: podiums },
              { k: "Golds", v: golds },
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
            {results.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-5"
              >
                <div className="col-span-12 md:col-span-6">
                  <div className="font-display text-xl font-bold uppercase leading-tight tracking-wide">
                    {r.events?.name}
                  </div>
                  <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                    {r.events?.sports?.name}
                  </div>
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
