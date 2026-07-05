import { TallyTable } from "@/components/tally-table";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { MedalTag } from "@/components/medals";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { RankingNav } from "@/components/ranking-nav";
import { createClient } from "@/lib/supabase/server";
import { getTally } from "@/lib/queries";
import { pointsForMedals } from "@/lib/scoring";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { parsePage, pageRange, formatTime } from "@/lib/utils";
import type { MedalKind, MedalTallyRow } from "@/lib/database.types";

type TodayMedal = {
  id: string;
  medal: MedalKind;
  mark: string | null;
  recorded_at: string;
  delegations: { abbrev: string; color: string } | null;
  athletes: { first_name: string; last_name: string } | null;
  events: {
    name: string;
    sports: { name: string } | null;
    categories: { name: string } | null;
  } | null;
};

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

  // Medals awarded today (Manila) — a live feed of the day's podium finishes.
  const supabase = createClient();
  const manilaDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const { data: todayData } = await supabase
    .from("results")
    .select(
      "id, medal, mark, recorded_at, delegations(abbrev, color), athletes(first_name, last_name), events(name, sports(name), categories(name))"
    )
    .in("medal", ["gold", "silver", "bronze"])
    .gte("recorded_at", `${manilaDate}T00:00:00+08:00`)
    .order("recorded_at", { ascending: false })
    .limit(30);
  const todayMedals = (todayData ?? []) as unknown as TodayMedal[];

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
          <div className="flex items-center gap-4">
            <a
              href="/present"
              target="_blank"
              rel="noopener"
              className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink/55 underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
            >
              Present ↗
            </a>
            <LiveStamp />
          </div>
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

      {/* ── Medals awarded today ─────────────────────────────────────── */}
      <section className="border-t border-ink/10 bg-bone-2/25">
        <div className="container py-14 md:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
              Medals <span className="text-gold">Awarded Today</span>
            </h2>
            <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
              {todayMedals.length} {todayMedals.length === 1 ? "medal" : "medals"} · PHT
            </span>
          </div>
          {todayMedals.length === 0 ? (
            <p className="mt-6 font-editorial text-xl italic text-ink/45">
              No medals awarded yet today — this feed fills as results are encoded.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-ink/12">
              {todayMedals.map((r) => {
                const athlete = r.athletes
                  ? `${r.athletes.first_name} ${r.athletes.last_name}`
                  : "Team";
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
                    <MedalTag medal={r.medal} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-bold uppercase tracking-wide">
                        {r.events?.name}
                      </div>
                      <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/50">
                        {r.events?.sports?.name}
                        {r.events?.categories?.name ? ` · ${r.events.categories.name}` : ""}
                      </div>
                    </div>
                    <div className="font-mono-data text-xs uppercase tracking-[0.12em] text-ink/70">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: r.delegations?.color ?? "#9ca3af" }}
                        />
                        {r.delegations?.abbrev}
                      </span>
                      <span className="text-ink/45"> · {athlete}</span>
                    </div>
                    <div className="w-full text-right font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/45 sm:w-auto">
                      {r.mark ? `${r.mark} · ` : ""}
                      <time dateTime={r.recorded_at}>{formatTime(r.recorded_at)}</time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
