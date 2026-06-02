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
  results: { count: number }[];
};

export default async function ResultsBrowsePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, type, sports(name), categories(name), results(count)")
    .order("created_at", { ascending: true });

  const events = (data ?? []) as unknown as EventRow[];
  const withResults = events.filter((e) => (e.results?.[0]?.count ?? 0) > 0);

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
                  {evs.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/results/${e.id}`}
                        className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-gold-deep"
                      >
                        <div>
                          <div className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                            {e.name}
                          </div>
                          <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                            {e.categories?.name} · {e.type}
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 opacity-40 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
