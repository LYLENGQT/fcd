import { TallyTable } from "@/components/tally-table";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { getTally } from "@/lib/queries";
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
  const totalMedals = tally.reduce((s, r) => s + (r.total ?? 0), 0);
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
          <dl className="grid grid-cols-3 gap-px overflow-hidden border border-on-inv/15 bg-on-inv/10">
            {[
              { k: "Leader", v: leader?.abbrev ?? "—" },
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
              </div>
            ))}
          </dl>
        }
      />

      <section className="container py-14 md:py-20">
        <div className="mb-5 flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
          </span>
          Overall Standings · {tally.length} Delegations
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
