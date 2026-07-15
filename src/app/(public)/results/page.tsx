import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Results",
  description: "Browse official results by sport and event.",
};

export const revalidate = 30;

type EventRow = {
  id: string;
  name: string;
  type: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
  results: {
    medal: string;
    delegations: { abbrev: string } | null;
    athletes: { last_name: string } | null;
  }[];
};

// Podium rows shown inline under each event. Dots use the true-metal tokens
// (bg-gold/bg-silver/bg-bronze); labels stay readable on the light canvas —
// silver has no dark variant, so its name is neutral ink and the dot carries
// the metal.
const PODIUM = [
  { medal: "gold" as const, name: "Gold", dot: "bg-gold ring-gold-deep/40", label: "text-gold-deep" },
  { medal: "silver" as const, name: "Silver", dot: "bg-silver ring-ink/25", label: "text-ink/60" },
  { medal: "bronze" as const, name: "Bronze", dot: "bg-bronze ring-bronze/50", label: "text-bronze" },
];

export default async function ResultsBrowsePage() {
  const supabase = createClient();
  const [{ data }, { count: totalEvents }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, name, type, sports(name), categories(name), results(medal, delegations(abbrev), athletes(last_name))"
      )
      .order("created_at", { ascending: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  const events = (data ?? []) as unknown as EventRow[];
  const withResults = events.filter((e) => (e.results?.length ?? 0) > 0);
  // `events` is fetched whole (no .range()), so eventsWithResults is global, not page-scoped.
  const eventsWithResults = withResults.length;

  // Group by sport.
  const bySport = new Map<string, EventRow[]>();
  for (const e of withResults) {
    const key = e.sports?.name ?? "Other";
    if (!bySport.has(key)) bySport.set(key, []);
    bySport.get(key)!.push(e);
  }

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Official Results · By Event"
        title={
          <>
            The
            <br />
            <span className="text-gold">Results</span>
          </>
        }
        intro="Every finished event and its podium. Pick an event to see the full standings."
      />

      <section className="container pt-10 md:pt-14">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
          <span className="text-gold-deep">{eventsWithResults}</span> of{" "}
          {totalEvents ?? eventsWithResults} events with results
        </p>
      </section>

      <section className="container py-14 md:py-20">
        {bySport.size === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No results published yet — check back once events finish.
          </div>
        ) : (
          <div className="space-y-12">
            {Array.from(bySport.entries()).map(([sport, evs]) => (
              <div key={sport}>
                <header className="flex items-end justify-between border-b-2 border-ink pb-3">
                  <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
                    {sport}
                  </h2>
                  <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
                    {evs.length} event{evs.length === 1 ? "" : "s"}
                  </span>
                </header>
                <ul className="divide-y divide-ink/12">
                  {evs.map((e) => {
                    const placements = e.results?.length ?? 0;
                    const podium = PODIUM.map((p) => ({
                      ...p,
                      r: e.results?.find((x) => x.medal === p.medal),
                    })).filter((p) => p.r?.delegations);
                    return (
                    <li key={e.id} className="transition-colors hover:bg-ink/[0.04]">
                      <Link
                        href={`/results/${e.id}`}
                        className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-gold-deep"
                      >
                        <div>
                          <div className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                            {e.name}
                          </div>
                          <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                            {e.categories?.name} · {e.type} · {placements} placement{placements === 1 ? "" : "s"}
                          </div>
                          {podium.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {podium.map((p) => (
                                <div
                                  key={p.medal}
                                  className="flex items-center gap-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/70"
                                >
                                  <span className={`inline-block h-1.5 w-1.5 rounded-full ring-1 ${p.dot}`} aria-hidden />
                                  <span className={p.label}>{p.name}</span>
                                  <span className="text-ink/40">·</span>
                                  <span>{p.r!.delegations!.abbrev}</span>
                                  {p.r!.athletes?.last_name && (
                                    <span className="text-ink/55">— {p.r!.athletes.last_name}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowUpRight aria-hidden className="h-5 w-5 shrink-0 opacity-40 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
