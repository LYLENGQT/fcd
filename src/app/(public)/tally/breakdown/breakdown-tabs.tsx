"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pointsForMedals } from "@/lib/scoring";

type SportRow = {
  sport_id: string;
  sport_name: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};
type DivisionRow = {
  level: string;
  gender: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};
type DelRow = {
  delegation_id: string;
  delegation_name: string;
  abbrev: string;
  color: string;
  total: number;
  points: number;
  cells: Record<string, number>;
};
type TopAthlete = {
  athlete_id: string;
  name: string;
  abbrev: string;
  delegation_name: string;
  color: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  points: number;
  events: string[];
};

export type BreakdownData = {
  byDivision: DivisionRow[];
  levels: string[];
  combinedSport: SportRow[];
  sportByLevel: Record<string, SportRow[]>;
  sportCols: { id: string; name: string }[];
  delRows: DelRow[];
  colTotals: Record<string, number>;
  maxCell: number;
  topAthletes: TopAthlete[];
  overallTotal: number;
  overallPoints: number;
};

type View = "division" | "sport" | "delegation" | "athlete";
type Scope = "all" | string;

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const pts = (m: { gold: number; silver: number; bronze: number }) =>
  pointsForMedals(m.gold, m.silver, m.bronze);

const TABS: { key: View; label: string }[] = [
  { key: "division", label: "By Division" },
  { key: "sport", label: "By Sport" },
  { key: "delegation", label: "By Delegation" },
  { key: "athlete", label: "By Athlete" },
];

export function BreakdownTabs(props: BreakdownData) {
  const [view, setView] = useState<View>("division");

  return (
    <div>
      {/* Tab bar */}
      <div role="tablist" aria-label="Breakdown views" className="flex flex-wrap gap-1 border-b border-ink/15">
        {TABS.map((t) => {
          const active = view === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setView(t.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 font-mono-data text-[11px] uppercase tracking-[0.2em] transition-colors",
                active
                  ? "border-gold text-gold-deep"
                  : "border-transparent text-ink/50 hover:text-ink"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {view === "division" && <DivisionView {...props} />}
        {view === "sport" && <SportView {...props} />}
        {view === "delegation" && <DelegationView {...props} />}
        {view === "athlete" && <AthleteView {...props} />}
      </div>
    </div>
  );
}

/* ── By Division ─────────────────────────────────────────────────────────── */
function DivisionView({ byDivision, levels }: BreakdownData) {
  return (
    <div className="space-y-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
        A division is a school level × gender category.
      </p>
      {levels.map((level) => {
        const rows = byDivision.filter((r) => r.level === level);
        const sub = rows.reduce(
          (a, r) => ({
            gold: a.gold + r.gold,
            silver: a.silver + r.silver,
            bronze: a.bronze + r.bronze,
            total: a.total + r.total,
          }),
          { gold: 0, silver: 0, bronze: 0, total: 0 }
        );
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
                <div key={`${row.level}-${row.gender}`} className="border border-ink/15 p-6">
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
  );
}

/* ── By Sport (one table, division toggle) ───────────────────────────────── */
function SportView({ combinedSport, sportByLevel, levels }: BreakdownData) {
  const [scope, setScope] = useState<Scope>("all");
  const rows = scope === "all" ? combinedSport : sportByLevel[scope] ?? [];
  const scopes: { key: Scope; label: string }[] = [
    { key: "all", label: "All" },
    ...levels.map((l) => ({ key: l, label: cap(l) })),
  ];

  return (
    <div>
      <div className="mb-4 inline-flex border border-ink/20">
        {scopes.map((s) => {
          const active = scope === s.key;
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={active}
              onClick={() => setScope(s.key)}
              className={cn(
                "px-3.5 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.18em] transition-colors",
                active ? "bg-ink text-bone" : "text-ink/60 hover:bg-ink/5"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <SportTable rows={rows} />
    </div>
  );
}

function SportTable({ rows }: { rows: SportRow[] }) {
  const sorted = [...rows].sort(
    (a, b) => pts(b) - pts(a) || b.total - a.total || a.sport_name.localeCompare(b.sport_name)
  );
  const totals = sorted.reduce(
    (a, r) => ({
      gold: a.gold + r.gold,
      silver: a.silver + r.silver,
      bronze: a.bronze + r.bronze,
      total: a.total + r.total,
    }),
    { gold: 0, silver: 0, bronze: 0, total: 0 }
  );
  if (sorted.length === 0) {
    return (
      <div className="border border-ink/15 px-6 py-12 text-center font-editorial text-xl italic text-ink/45">
        No medals in this division yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto border border-ink/15">
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
              <td className="px-4 py-3 text-right font-display text-base font-black">{r.total}</td>
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
            <td className="px-4 py-3 text-center font-display text-sm font-black">{totals.gold}</td>
            <td className="px-4 py-3 text-center font-display text-sm font-black">{totals.silver}</td>
            <td className="px-4 py-3 text-center font-display text-sm font-black">{totals.bronze}</td>
            <td className="px-4 py-3 text-right font-display text-base font-black">{totals.total}</td>
            <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
              {pts(totals)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── By Delegation (heatmap) ─────────────────────────────────────────────── */
function DelegationView({
  delRows,
  sportCols,
  colTotals,
  maxCell,
  overallTotal,
  overallPoints,
}: BreakdownData) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-editorial text-sm italic text-ink/50">
          Each cell is the total medals a delegation won in that sport.
        </p>
        <div className="flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
          <span>Fewer</span>
          <span
            className="h-2.5 w-24 rounded-sm ring-1 ring-ink/15"
            style={{
              background:
                "linear-gradient(to right, hsl(var(--ink) / 0.06), hsl(var(--ink) / 0.44))",
            }}
            aria-hidden
          />
          <span>More · max {maxCell}</span>
        </div>
      </div>
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
          <thead>
            <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">
              <Th align="left" sticky>
                Delegation
              </Th>
              {sportCols.map((s) => (
                <Th key={s.id} align="center">
                  {s.name}
                </Th>
              ))}
              <Th align="right">Total</Th>
              <Th align="right" title="Championship points (Gold 5 · Silver 3 · Bronze 1)">
                Pts
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/12">
            {delRows.map((d) => (
              <tr key={d.delegation_id} className="bg-bone">
                <td className="sticky left-0 z-10 whitespace-nowrap bg-bone px-4 py-3 font-display text-sm font-bold uppercase tracking-wide">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.abbrev || d.delegation_name}
                  </span>
                </td>
                {sportCols.map((s) => {
                  const t = d.cells[s.id] ?? 0;
                  return (
                    <td
                      key={s.id}
                      className="px-4 py-3 text-center font-mono-data text-sm"
                      style={{
                        backgroundColor:
                          t > 0
                            ? `hsl(var(--ink) / ${(0.06 + 0.38 * (t / maxCell)).toFixed(3)})`
                            : undefined,
                      }}
                    >
                      {t > 0 ? t : <span className="text-ink/25">·</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right font-display text-base font-black">{d.total}</td>
                <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                  {d.points}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink bg-bone-2/60">
              <td className="sticky left-0 z-10 bg-bone-2 px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55">
                Total
              </td>
              {sportCols.map((s) => (
                <td key={s.id} className="px-4 py-3 text-center font-display text-sm font-black">
                  {colTotals[s.id] ?? 0}
                </td>
              ))}
              <td className="px-4 py-3 text-right font-display text-base font-black">
                {overallTotal}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                {overallPoints}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── By Athlete (top medalists) ──────────────────────────────────────────── */
function AthleteView({ topAthletes }: BreakdownData) {
  if (topAthletes.length === 0) {
    return (
      <div className="border border-ink/15 px-6 py-12 text-center font-editorial text-xl italic text-ink/45">
        No individual medals yet — team events don&rsquo;t count toward athlete totals.
      </div>
    );
  }
  return (
    <div>
      <p className="mb-4 font-editorial text-sm italic text-ink/50">
        Athletes ranked by championship points from their own medals (team events excluded).
      </p>
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full border-collapse" style={{ minWidth: "720px" }}>
          <thead>
            <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">
              <Th align="right">#</Th>
              <Th align="left" sticky>
                Athlete
              </Th>
              <Th align="center" title="Gold">G</Th>
              <Th align="center" title="Silver">S</Th>
              <Th align="center" title="Bronze">B</Th>
              <Th align="right">Total</Th>
              <Th align="right" title="Championship points (Gold 5 · Silver 3 · Bronze 1)">Pts</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/12">
            {topAthletes.map((a, i) => (
              <tr key={a.athlete_id} className="bg-bone transition-colors hover:bg-ink/[0.06]">
                <td className="px-4 py-3 text-right font-display text-lg font-black leading-none text-ink/50">
                  {i + 1}
                </td>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-bone px-4 py-3">
                  <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    {a.name}
                  </div>
                  <div className="mt-0.5 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/45">
                    {a.abbrev}
                    {a.events.length > 0 ? ` · ${a.events.join(" · ")}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-mono-data text-sm">{a.gold}</td>
                <td className="px-4 py-3 text-center font-mono-data text-sm">{a.silver}</td>
                <td className="px-4 py-3 text-center font-mono-data text-sm">{a.bronze}</td>
                <td className="px-4 py-3 text-right font-display text-base font-black">{a.total}</td>
                <td className="px-4 py-3 text-right font-display text-lg font-black text-gold-deep">
                  {a.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── shared bits ─────────────────────────────────────────────────────────── */
function Th({
  children,
  align,
  title,
  sticky,
}: {
  children: React.ReactNode;
  align: "left" | "center" | "right";
  title?: string;
  sticky?: boolean;
}) {
  const cls =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <th
      title={title}
      className={cn(
        "px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-inv/70",
        cls,
        sticky && "sticky left-0 z-10 bg-surface-inv"
      )}
    >
      {children}
    </th>
  );
}

function MedalStat({ label, value, tone }: { label: string; value: number; tone: string }) {
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
