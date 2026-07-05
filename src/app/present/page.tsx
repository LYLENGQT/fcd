import Image from "next/image";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { getTally } from "@/lib/queries";
import type { MedalTallyRow } from "@/lib/database.types";

export const metadata = { title: "Medal Tally — Presentation" };

// Fast auto-refresh for a venue display (Realtime pushes sooner).
export const revalidate = 20;

const RANK_ACCENT: Record<number, string> = {
  1: "text-gold",
  2: "text-silver",
  3: "text-bronze",
};

export default async function PresentPage() {
  const tally = (await getTally()) as MedalTallyRow[];
  const totalMedals = tally.reduce((s, r) => s + (r.total ?? 0), 0);

  return (
    <main id="main" className="grain min-h-dvh bg-surface-inv text-on-inv">
      <RealtimeRefresher table="results" />
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-12 md:py-12">
        {/* Masthead */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-on-inv/15 pb-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center rounded bg-white p-1.5 shadow-lg">
              <Image
                src="/logo.jpg"
                alt="FCDSA Meet Guimbal 2026"
                width={1366}
                height={2049}
                priority
                className="h-14 w-auto md:h-16"
              />
            </span>
            <div>
              <div className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
                FCDSA Meet 2026 · Guimbal, Iloilo
              </div>
              <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
                Medal <span className="text-gold">Tally</span>
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-6xl font-black leading-none md:text-8xl">
              {totalMedals}
            </div>
            <div className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/55">
              Medals Awarded
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
            </span>
            Live · {tally.length} Delegations
          </span>
          <LiveStamp showDot className="text-on-inv/60" />
        </div>

        {/* Big tally */}
        {tally.length === 0 ? (
          <div className="mt-16 text-center font-editorial text-3xl italic text-on-inv/45">
            The board awaits its first medal.
          </div>
        ) : (
          <table className="mt-6 w-full border-collapse">
            <thead>
              <tr className="border-b border-on-inv/20 font-mono-data text-[11px] uppercase tracking-[0.25em] text-on-inv/55">
                <th className="py-3 text-left">Rank</th>
                <th className="py-3 text-left">Delegation</th>
                <th className="py-3 text-center">Gold</th>
                <th className="py-3 text-center">Silver</th>
                <th className="py-3 text-center">Bronze</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-inv/10">
              {tally.map((r) => (
                <tr key={r.delegation_id}>
                  <td className="py-4 pr-4">
                    <span
                      className={`font-display text-4xl font-black leading-none md:text-6xl ${
                        RANK_ACCENT[r.rank] ?? "text-on-inv/70"
                      }`}
                    >
                      {String(r.rank).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-3">
                      <span
                        className="inline-block h-5 w-5 shrink-0 rounded-sm ring-2 ring-on-inv/20"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="font-display text-2xl font-black uppercase leading-none tracking-wide md:text-4xl">
                        {r.delegation_name}
                      </span>
                      <span className="font-mono-data text-xs uppercase tracking-[0.2em] text-on-inv/40 md:text-sm">
                        {r.abbrev}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 text-center font-display text-3xl font-black md:text-5xl">
                    {r.gold}
                  </td>
                  <td className="py-4 text-center font-display text-3xl font-black md:text-5xl">
                    {r.silver}
                  </td>
                  <td className="py-4 text-center font-display text-3xl font-black md:text-5xl">
                    {r.bronze}
                  </td>
                  <td className="py-4 text-right font-display text-4xl font-black text-gold md:text-6xl">
                    {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
