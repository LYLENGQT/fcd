import { TallyTable } from "@/components/tally-table";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RankingNav } from "@/components/ranking-nav";
import { getTally } from "@/lib/queries";
import { pointsForMedals } from "@/lib/scoring";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { MedalTallyRow } from "@/lib/database.types";

export const metadata = {
  title: "Medal Tally",
  description: "Live medal standings by delegation.",
};

// Time-based fallback (thin realtime); Realtime subscription pushes faster.
export const revalidate = 30;

export default async function TallyPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const tally = (await getTally()) as MedalTallyRow[];

  const totalGold = tally.reduce((s, r) => s + (r.gold ?? 0), 0);
  const totalSilver = tally.reduce((s, r) => s + (r.silver ?? 0), 0);
  const totalBronze = tally.reduce((s, r) => s + (r.bronze ?? 0), 0);
  const totalMedals = tally.reduce((s, r) => s + (r.total ?? 0), 0);
  const totalPoints = pointsForMedals(totalGold, totalSilver, totalBronze);
  const leader = tally.find((r) => r.rank === 1);

  // The tally view is small and the aggregates above need every row, so we
  // fetch the full ranking and slice the current page in memory.
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);
  const pageRows = tally.slice(from, to + 1);

  return (
    <>
      <RealtimeRefresher table="results" />

      <PageHeader
        index="01"
        eyebrow="Standings · Updated Live"
        title={
          <>
            Medal
            <br />
            <span className="text-gold">Tally</span>
          </>
        }
        intro="Every gold, silver, and bronze the moment it is encoded. The board re-ranks itself in real time."
        aside={
          <div>
            <dl className="grid grid-cols-3 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10">
              {[
                { k: "Leader", v: leader?.abbrev ?? "—", sub: leader?.delegation_name },
                { k: "Golds", v: totalGold },
                { k: "Medals", v: totalMedals },
              ].map((s) => (
                <div key={s.k} className="bg-surface-inv px-4 py-5">
                  <dt className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-on-inv/55">
                    {s.k}
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-black text-on-inv">
                    {s.v}
                  </dd>
                  {s.sub && (
                    <dd className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.18em] text-on-inv/55">
                      {s.sub}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/55">
              Awarded so far: {totalGold}G · {totalSilver}S · {totalBronze}B ={" "}
              {totalMedals} medals · {totalPoints} pts
            </p>
          </div>
        }
      />

      <section className="container py-14 md:py-20">
        <RankingNav current="tally" />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
            </span>
            Overall Standings · {tally.length} Delegations
          </div>
          <LiveStamp />
        </div>
        <TallyTable rows={pageRows} linkDelegations />
        <Pagination
          page={page}
          totalCount={tally.length}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath="/tally"
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
