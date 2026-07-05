import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { RankingNav } from "@/components/ranking-nav";
import { pointsForMedals } from "@/lib/scoring";
import { BreakdownTabs, type BreakdownData } from "./breakdown-tabs";
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

type Counts = { gold: number; silver: number; bronze: number; total: number };
const addInto = (a: Counts, b: Counts) => {
  a.gold += b.gold;
  a.silver += b.silver;
  a.bronze += b.bronze;
  a.total += b.total;
};

export default async function MedalBreakdownPage() {
  const supabase = createClient();
  const [
    { data: divisionData },
    { data: sportData },
    { data: delSportData },
    { data: athleteMedalData },
  ] = await Promise.all([
    supabase.from("medal_by_division").select("*"),
    supabase.from("medal_by_sport").select("*"),
    supabase.from("medal_by_delegation_sport").select("*"),
    supabase
      .from("results")
      .select(
        "medal, athlete_id, athletes(first_name, last_name, delegations(abbrev, name, color)), events(name)"
      )
      .in("medal", ["gold", "silver", "bronze"])
      .not("athlete_id", "is", null),
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

  const overall: Counts = { gold: 0, silver: 0, bronze: 0, total: 0 };
  byDivision.forEach((r) => addInto(overall, r));
  const overallPoints = pointsForMedals(overall.gold, overall.silver, overall.bronze);

  const levels = Array.from(new Set(byDivision.map((r) => r.level))).sort(
    (a, b) => (LEVEL_ORDER[a] ?? 9) - (LEVEL_ORDER[b] ?? 9)
  );

  // Combined sport (all divisions) + per-level slices — plain, serializable.
  type SportRow = { sport_id: string; sport_name: string } & Counts;
  const combinedMap = new Map<string, SportRow>();
  for (const r of bySport) {
    const cur =
      combinedMap.get(r.sport_id) ??
      ({ sport_id: r.sport_id, sport_name: r.sport_name, gold: 0, silver: 0, bronze: 0, total: 0 } as SportRow);
    addInto(cur, r);
    combinedMap.set(r.sport_id, cur);
  }
  const combinedSport = Array.from(combinedMap.values());
  const sportByLevel: Record<string, SportRow[]> = {};
  for (const lvl of levels) {
    sportByLevel[lvl] = bySport
      .filter((r) => r.level === lvl)
      .map((r) => ({
        sport_id: r.sport_id,
        sport_name: r.sport_name,
        gold: r.gold,
        silver: r.silver,
        bronze: r.bronze,
        total: r.total,
      }));
  }
  const sportCols = [...combinedSport]
    .sort((a, b) => a.sport_name.localeCompare(b.sport_name))
    .map((s) => ({ id: s.sport_id, name: s.sport_name }));

  // Delegation × sport matrix — cells as a plain object (Map isn't serializable).
  type DelRow = {
    delegation_id: string;
    delegation_name: string;
    abbrev: string;
    color: string;
    total: number;
    points: number;
    cells: Record<string, number>;
  };
  const delMap = new Map<string, DelRow & Counts>();
  for (const r of delSport) {
    let d = delMap.get(r.delegation_id);
    if (!d) {
      d = {
        delegation_id: r.delegation_id,
        delegation_name: r.delegation_name,
        abbrev: r.abbrev,
        color: r.color,
        cells: {},
        total: 0,
        points: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
      };
      delMap.set(r.delegation_id, d);
    }
    d.cells[r.sport_id] = (d.cells[r.sport_id] ?? 0) + r.total;
    addInto(d, r);
  }
  const delRows: DelRow[] = Array.from(delMap.values())
    .map((d) => ({
      delegation_id: d.delegation_id,
      delegation_name: d.delegation_name,
      abbrev: d.abbrev,
      color: d.color,
      total: d.total,
      points: pointsForMedals(d.gold, d.silver, d.bronze),
      cells: d.cells,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.total - a.total ||
        a.delegation_name.localeCompare(b.delegation_name)
    );
  const colTotals: Record<string, number> = {};
  for (const s of sportCols) colTotals[s.id] = combinedMap.get(s.id)?.total ?? 0;
  const maxCell = Math.max(1, ...delSport.map((r) => r.total));

  // ── Top athletes (by medals) — aggregate individual medal rows in memory ──
  type AthleteMedalRow = {
    medal: "gold" | "silver" | "bronze";
    athlete_id: string;
    athletes: {
      first_name: string;
      last_name: string;
      delegations: { abbrev: string; name: string; color: string } | null;
    } | null;
    events: { name: string } | null;
  };
  type AthAgg = {
    athlete_id: string;
    name: string;
    abbrev: string;
    delegation_name: string;
    color: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
    events: string[];
  };
  const athMap = new Map<string, AthAgg>();
  for (const r of (athleteMedalData ?? []) as unknown as AthleteMedalRow[]) {
    if (!r.athlete_id || !r.athletes) continue;
    let a = athMap.get(r.athlete_id);
    if (!a) {
      a = {
        athlete_id: r.athlete_id,
        name: `${r.athletes.first_name} ${r.athletes.last_name}`,
        abbrev: r.athletes.delegations?.abbrev ?? "",
        delegation_name: r.athletes.delegations?.name ?? "",
        color: r.athletes.delegations?.color ?? "#9ca3af",
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
        events: [],
      };
      athMap.set(r.athlete_id, a);
    }
    a[r.medal] += 1;
    a.total += 1;
    if (r.events?.name && !a.events.includes(r.events.name)) a.events.push(r.events.name);
  }
  const topAthletes = Array.from(athMap.values())
    .map((a) => ({ ...a, points: pointsForMedals(a.gold, a.silver, a.bronze) }))
    .sort(
      (x, y) =>
        y.points - x.points ||
        y.total - x.total ||
        y.gold - x.gold ||
        x.name.localeCompare(y.name)
    );

  const data: BreakdownData = {
    byDivision,
    levels,
    combinedSport,
    sportByLevel,
    sportCols,
    delRows,
    colTotals,
    maxCell,
    topAthletes,
    overallTotal: overall.total,
    overallPoints,
  };

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
        intro="How the medals split across divisions, sports, and delegations — pick a lens below. Updated live as results are encoded."
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
          <div className="space-y-10">
            <RankingNav current="breakdown" />

            {/* Meet totals */}
            <div>
              <div className="grid grid-cols-2 gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-3 lg:grid-cols-6">
                <Tile label="Total Medals" value={overall.total} />
                <Tile label="Gold" value={overall.gold} tone="bg-gold" />
                <Tile label="Silver" value={overall.silver} tone="bg-silver" />
                <Tile label="Bronze" value={overall.bronze} tone="bg-bronze" />
                <Tile label="Points" value={overallPoints} />
                <Tile label="Delegations" value={delRows.length} />
              </div>
              <p className="mt-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                Points = Gold ×5 · Silver ×3 · Bronze ×1
              </p>
            </div>

            {/* Tabbed lenses */}
            <BreakdownTabs {...data} />
          </div>
        )}
      </section>
    </>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: string }) {
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
