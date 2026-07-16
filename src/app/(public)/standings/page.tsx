import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { LiveStamp } from "@/components/live-stamp";
import { RankingNav } from "@/components/ranking-nav";
import { getStandings } from "@/lib/queries";

export const metadata = {
  title: "Overall Standings",
  description: "Championship points standings by delegation (gold 5 · silver 3 · bronze 1).",
};

export const revalidate = 30;

export default async function StandingsPage() {
  const rows = await getStandings();
  const leader = rows.find((r) => r.rank === 1);
  const second = rows.find((r) => r.rank === 2);
  const totalPointsAwarded = rows.reduce((s, r) => s + r.points, 0);

  return (
    <>
      <RealtimeRefresher table="results" />
      <PageHeader
        index="01"
        eyebrow="Championship · Overall Points"
        views={<RankingNav current="standings" />}
        title={
          <>
            Overall
            <br />
            <span className="text-gold">Standings</span>
          </>
        }
        intro="The race for the overall crown. Points: gold 5 · silver 3 · bronze 1 — re-ranked live as results are encoded."
        aside={
          <div className="border border-on-inv/15 bg-on-inv/10 px-5 py-4">
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/55">
              Current Leader
            </p>
            <p className="mt-1 font-display text-3xl font-black text-on-inv">
              {leader?.abbrev ?? "—"}
            </p>
            {leader?.delegation_name && (
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/55">
                {leader.delegation_name}
              </p>
            )}
            <p className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-gold">
              {leader ? `${leader.points} pts` : "no points yet"}
            </p>
            {leader && second && (
              <p className="mt-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/55">
                Lead: +{leader.points - second.points} pts over {second.abbrev}
              </p>
            )}
            <p className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/55">
              Total points awarded: {totalPointsAwarded}
            </p>
          </div>
        }
      />

      <section className="container py-14 md:py-20">
        {rows.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No standings yet — points appear as medals are awarded.
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.3em] text-ink/55">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
              </span>
              Championship Points · {rows.length} Delegations
            </div>
            <p className="mb-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
              Points = Gold ×5 · Silver ×3 · Bronze ×1
            </p>
            <div className="overflow-x-auto border border-ink/15">
              <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-surface-inv text-on-inv">
                  {["Rank", "Delegation", "Gold", "Silver", "Bronze", "Points"].map(
                    (h, i) => (
                      <th
                        key={h}
                        title={
                          i === 5
                            ? "Championship points: Gold 5 · Silver 3 · Bronze 1"
                            : undefined
                        }
                        className={`px-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.22em] ${
                          i === 0 || i === 1
                            ? "text-left text-on-inv/70"
                            : i === 5
                              ? "text-right text-gold"
                              : "text-center text-on-inv/70"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/12">
                {rows.map((r) => (
                  <tr
                    key={r.delegation_id}
                    className="bg-bone transition-colors hover:bg-ink/[0.06]"
                  >
                    <td className="px-4 py-4">
                      <span
                        className={`font-display text-3xl font-black leading-none ${
                          r.rank === 1 ? "text-gold" : "text-ink/80"
                        }`}
                      >
                        {String(r.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/delegations/${r.slug}`}
                        className="flex items-center gap-3 transition-colors hover:text-gold-deep"
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-sm ring-2 ring-ink/15"
                          style={{ backgroundColor: r.color }}
                          aria-hidden
                        />
                        <span className="font-display text-xl font-bold uppercase tracking-wide">
                          {r.delegation_name}
                        </span>
                        <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
                          {r.abbrev}
                        </span>
                      </Link>
                      <span className="mt-1 block font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
                        {r.rank === 1
                          ? "— leader"
                          : `-${(leader?.points ?? r.points) - r.points}`}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center font-mono-data tabular-nums text-ink/70">
                      {r.gold}
                    </td>
                    <td className="px-3 py-4 text-center font-mono-data tabular-nums text-ink/70">
                      {r.silver}
                    </td>
                    <td className="px-3 py-4 text-center font-mono-data tabular-nums text-ink/70">
                      {r.bronze}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-display text-3xl font-black leading-none">
                        {r.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-5 flex justify-end border-t border-ink/10 pt-4">
              <LiveStamp />
            </div>
          </>
        )}
      </section>
    </>
  );
}
