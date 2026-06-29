import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { RankingNav } from "@/components/ranking-nav";
import { pointsForMedals } from "@/lib/scoring";
import type {
  MedalByDivisionRow,
  MedalBySportRow,
  MedalByDelegationSportRow,
} from "@/lib/database.types";

export const metadata = {
  title: "Medal Breakdown",
  description: "Medals by division, sport, and delegation across the meet.",
};

export const revalidate = 60;

const LEVEL_ORDER: Record<string, number> = { elementary: 0, secondary: 1 };
const GENDER_ORDER: Record<string, number> = { boys: 0, girls: 1, mixed: 2 };
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const pts = (m: { gold: number; silver: number; bronze: number }) =>
  pointsForMedals(m.gold, m.silver, m.bronze);

type Counts = { gold: number; silver: number; bronze: number; total: number };
const zero = (): Counts => ({ gold: 0, silver: 0, bronze: 0, total: 0 });
const add = (a: Counts, b: Counts) => {
  a.gold += b.gold;
  a.silver += b.silver;
  a.bronze += b.bronze;
  a.total += b.total;
  return a;
};

export default async function MedalBreakdownPage() {
  const supabase = createClient();
  const [{ data: divisionData }, { data: sportData }, { data: delSportData }] =
    await Promise.all([
      supabase.from("medal_by_division").select("*"),
      supabase.from("medal_by_sport").select("*"),
      supabase.from("medal_by_delegation_sport").select("*"),
    ]);

  const byDivision = ((divisionData ?? []) as MedalByDivisionRow[]).sort(
    (a, b) =>
      (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9) ||
      (GENDER_ORDER[a.gender] ?? 9) - (GENDER_ORDER[b.gender] ?? 9)
  );
  const bySport = (sportData ?? []) as MedalBySportRow[];
  const delSport = (delSportData ?? []) as MedalByDelegationSportRow[];

  const hasData =
    byDivision.length > 0 || bySport.length > 0 || delSport.length > 0;

  // ── Meet-wide totals (overview) ──────────────────────────────────────────
  const overall = byDivision.reduce((acc, r) => add(acc, r), zero());
  const overallPoints = pts(overall);

  // ── Division section: levels present, in order ───────────────────────────
  const levelsPresent = Array.from(new Set(byDivision.map((r) => r.level))).sort(
    (a, b) => (LEVEL_ORDER[a] ?? 9) - (LEVEL_ORDER[b] ?? 9)
  );

  // ── Combined sport (all divisions) — aggregate medal_by_sport by sport ────
  type SportAgg = Counts & { sport_id: string; sport_name: string };
  const combinedMap = new Map<string, SportAgg>();
  for (const r of bySport) {
    const cur =
      combinedMap.get(r.sport_id) ??
      ({ sport_id: r.sport_id, sport_name: r.sport_name, ...zero() } as SportAgg);
    add(cur, r);
    combinedMap.set(r.sport_id, cur);
  }
  const combinedSport = Array.from(combinedMap.values()).sort(
    (a, b) =>
      pts(b) - pts(a) || b.total - a.total || a.sport_name.localeCompare(b.sport_name)
  );

  // Sport columns for the heatmap (stable alphabetical order).
  const sportCols = [...combinedSport]
    .sort((a, b) => a.sport_name.localeCompare(b.sport_name))
    .map((s) => ({ id: s.sport_id, name: s.sport_name }));

  // ── Delegation × sport matrix ────────────────────────────────────────────
  type DelAgg = Counts & {
    delegation_id: string;
    delegation_name: string;
    abbrev: string;
    color: string;
    cells: Map<string, number>; // sport_id -> total medals
  };
  const delMap = new Map<string, DelAgg>();
  for (const r of delSport) {
    let d = delMap.get(r.delegation_id);
    if (!d) {
      d = {
        delegation_id: r.delegation_id,
        delegation_name: r.delegation_name,
        abbrev: r.abbrev,
        color: r.color,
        cells: new Map(),
        ...zero(),
      };
      delMap.set(r.delegation_id, d);
    }
    d.cells.set(r.sport_id, (d.cells.get(r.sport_id) ?? 0) + r.total);
    add(d, r);
  }
  const delRows = Array.from(delMap.values())
    .map((d) => ({ ...d, points: pts(d) }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.total - a.total ||
        a.delegation_name.localeCompare(b.delegation_name)
    );
  const maxCell = Math.max(1, ...delSport.map((r) => r.total));
  const colTotal = (sportId: string) => combinedMap.get(sportId)?.total ?? 0;

  return (
    <>
      <RealtimeRefresher table="results" />
      <PageHeader
        eyebrow="Rankings · Division · Sport · Delegation"
        title={
          <>
            Medal <span className="text-gold">Breakdown</span>
          </>
        }
        intro="How the medals split across divisions, sports, and delegations — updated live as results are encoded."
      />

      <section className="container py-14 md:py-20">
        <div className="mb-6 flex justify-end">
          <LiveStamp showDot />
        </div>
        {!hasData ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Medals will break down here once results are in.
          </div>
        ) : (
          <div className="space-y-16">
            <RankingNav current="breakdown" />

            {/* ── Overview ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-3 lg:grid-cols-6">
              <Tile label="Total Medals" value={overall.total} />
              <Tile label="Gold" value={overall.gold} tone="bg-gold" />
              <Tile label="Silver" value={overall.silver} tone="bg-silver" />
              <Tile label="Bronze" value={overall.bronze} tone="bg-bronze" />
              <Tile label="Points" value={overallPoints} />
              <Tile label="Delegations" value={delRows.length} />
            </div>

            {/* ── By Division (gender split) ───────────────────────── */}
            {byDivision.length > 0 && (
              <div>
                <SectionHeading>
                  By <span className="text-gold">Division</span>
                </SectionHeading>
                <p className="mt-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                  A division is a school level × gender category.
                </p>
                <div className="mt-6 space-y-10">
                  {levelsPresent.map((level) => {
                    const rows = byDivision.filter((r) => r.level === level);
                    const sub = rows.reduce((acc, r) => add(acc, r), zero());
                    return (
                      <div key={level}>
                        <div className="flex items-baseline justify-between border-b border-ink/15 pb-2">
                          <h3 className="font-display text-lg font-black uppercase tracking-tight">
                            {cap(level)}
                          </h3>
                          <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                            {sub.total} medals · {pts(sub)} pts
                          </span>
                        </div>
                        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {rows.map((row) => (
                            <div
                              key={`${row.level}-${row.gender}`}
                              className="border border-ink/15 p-6"
                            >
                              <div className="flex items-baseline justify-between border-b border-ink/15 pb-3">
                                <h4 className="font-display text-xl font-black uppercase tracking-tight">
                                  {cap(row.gender)}
                                </h4>
                                <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                                  {pts(row)} pts
                                </span>
                              </div>
                              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <MedalStat label="Gold" value={row.gold} tone="bg-gold" />
                                <MedalStat label="Silver" value={row.silver} tone="bg-silver" />
                                <MedalStat label="Bronze" value={row.bronze} tone="bg-bronze" />
                              </dl>
                              <div className="mt-4 border-t border-ink/10 pt-3 text-center font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                                {row.total} medals
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── By Sport — All Divisions ─────────────────────────── */}
            {combinedSport.length > 0 && (
              <div>
                <SectionHeading>
                  By Sport · <span className="text-gold">All Divisions</span>
                </SectionHeading>
                <SportTable rows={combinedSport} />
              </div>
            )}

            {/* ── By Sport — per division ──────────────────────────── */}
            {levelsPresent.map((level) => {
              const rows = bySport.filter((r) => r.level === level);
              if (rows.length === 0) return null;
              return (
                <div key={level}>
                  <SectionHeading>
                    By Sport · <span className="text-gold">{cap(level)}</span>
                  </SectionHeading>
                  <SportTable rows={rows} />
                </div>
              );
            })}

            {/* ── Delegation × Sport heatmap ───────────────────────── */}
            {delRows.length > 0 && sportCols.length > 0 && (
              <div>
                <SectionHeading>
                  By <span className="text-gold">Delegation</span> · per Sport
                </SectionHeading>
                <p className="mt-2 font-editorial text-sm italic text-ink/45">
                  Medals each delegation has won in every sport. Darker cells = more medals
                  (darkest cell = {maxCell} medals).
                </p>
                <div className="mt-4 overflow-x-auto border border-ink/15">
                  <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
                    <thead>
                      <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">
                        <Th align="left">Delegation</Th>
                        {sportCols.map((s) => (
                          <Th key={s.id} align="center">
                            {s.name}
                          </Th>
                        ))}
                        <Th align="right">Total</Th>
                        <Th align="right">Pts</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/12">
                      {delRows.map((d) => (
                        <tr key={d.delegation_id} className="bg-bone">
                          <td className="whitespace-nowrap px-4 py-3 font-display text-sm font-bold uppercase tracking-wide">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              {d.abbrev || d.delegation_name}
                            </span>
                          </td>
                          {sportCols.map((s) => {
                            const t = d.cells.get(s.id) ?? 0;
                            return (
                              <td
                                key={s.id}
                                className="px-4 py-3 text-center font-mono-data text-sm"
                                style={{
                                  backgroundColor:
                                    t > 0
                                      ? `hsl(var(--gold) / ${(0.12 + 0.66 * (t / maxCell)).toFixed(3)})`
                                      : undefined,
                                }}
                              >
                                {t > 0 ? t : <span className="text-ink/25">·</span>}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-right font-display text-base font-black">
                            {d.total}
                          </td>
                          <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                            {d.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-ink bg-bone-2/60">
                        <td className="px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55">
                          Total
                        </td>
                        {sportCols.map((s) => (
                          <td
                            key={s.id}
                            className="px-4 py-3 text-center font-display text-sm font-black"
                          >
                            {colTotal(s.id)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-display text-base font-black">
                          {overall.total}
                        </td>
                        <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                          {overallPoints}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

/* ── helper components ───────────────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
      {children}
    </h2>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="bg-bone px-5 py-6 text-center">
      <div className="font-display text-3xl font-black">{value}</div>
      <div className="mt-1 flex items-center justify-center gap-1.5 font-mono-data text-[9px] uppercase tracking-[0.18em] text-ink/50">
        {tone && <span className={`inline-block h-2 w-2 rounded-full ${tone}`} />}
        {label}
      </div>
    </div>
  );
}

function Th({
  children,
  align,
  title,
}: {
  children: React.ReactNode;
  align: "left" | "center" | "right";
  title?: string;
}) {
  const cls =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <th
      title={title}
      className={`px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70 ${cls}`}
    >
      {children}
    </th>
  );
}

function SportTable({
  rows,
}: {
  rows: Array<{
    sport_id: string;
    sport_name: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  }>;
}) {
  const sorted = [...rows].sort(
    (a, b) => pts(b) - pts(a) || b.total - a.total || a.sport_name.localeCompare(b.sport_name)
  );
  const totals = sorted.reduce((acc, r) => add(acc, r), zero());
  return (
    <div className="mt-4 overflow-x-auto border border-ink/15">
      <table className="w-full border-collapse" style={{ minWidth: "560px" }}>
        <thead>
          <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">
            <Th align="left">Sport</Th>
            <Th align="center" title="Gold">G</Th>
            <Th align="center" title="Silver">S</Th>
            <Th align="center" title="Bronze">B</Th>
            <Th align="right">Total</Th>
            <Th align="right" title="Championship points (Gold 5 · Silver 3 · Bronze 1)">Pts</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/12">
          {sorted.map((r) => (
            <tr key={r.sport_id} className="bg-bone transition-colors hover:bg-ink/[0.06]">
              <td className="px-4 py-3 font-display text-sm font-bold uppercase tracking-wide">
                {r.sport_name}
              </td>
              <td className="px-4 py-3 text-center font-mono-data text-sm">{r.gold}</td>
              <td className="px-4 py-3 text-center font-mono-data text-sm">{r.silver}</td>
              <td className="px-4 py-3 text-center font-mono-data text-sm">{r.bronze}</td>
              <td className="px-4 py-3 text-right font-display text-base font-black">
                {r.total}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                {pts(r)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-ink bg-bone-2/60">
            <td className="px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55">
              Total
            </td>
            <td className="px-4 py-3 text-center font-display text-sm font-black">
              {totals.gold}
            </td>
            <td className="px-4 py-3 text-center font-display text-sm font-black">
              {totals.silver}
            </td>
            <td className="px-4 py-3 text-center font-display text-sm font-black">
              {totals.bronze}
            </td>
            <td className="px-4 py-3 text-right font-display text-base font-black">
              {totals.total}
            </td>
            <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
              {pts(totals)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function MedalStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div>
      <div className="font-display text-2xl font-black">{value}</div>
      <div className="mt-1 flex items-center justify-center gap-1 font-mono-data text-[9px] uppercase tracking-[0.15em] text-ink/50">
        <span className={`inline-block h-2 w-2 rounded-full ${tone}`} />
        {label}
      </div>
    </div>
  );
}
