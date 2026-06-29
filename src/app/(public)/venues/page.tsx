import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import type { Venue } from "@/lib/database.types";

type VenueSchedule = {
  venue: string;
  start_at: string;
  status: string;
  events: { sports: { name: string } | null } | null;
};

export const metadata = {
  title: "Venues",
  description: "Where the meet happens — competition sites and directions.",
};

export const revalidate = 300;

export default async function VenuesPage() {
  const supabase = createClient();
  const [{ data }, { data: schedData }] = await Promise.all([
    supabase.from("venues").select("*").order("name"),
    supabase.from("schedules").select("venue, start_at, status, events(sports(name))"),
  ]);
  const venues = (data ?? []) as Venue[];
  const schedules = (schedData ?? []) as unknown as VenueSchedule[];

  // Aggregate schedules per venue by case-insensitive, trimmed name match.
  const norm = (s: string) => s.trim().toLowerCase();
  const byVenue = new Map<string, { sessions: number; sports: Set<string> }>();
  for (const s of schedules) {
    if (!s.venue) continue;
    const key = norm(s.venue);
    const agg = byVenue.get(key) ?? { sessions: 0, sports: new Set<string>() };
    agg.sessions += 1;
    const sport = s.events?.sports?.name;
    if (sport) agg.sports.add(sport);
    byVenue.set(key, agg);
  }

  return (
    <>
      <PageHeader
        index="07"
        eyebrow="The Host · Where to Go"
        title={
          <>
            The
            <br />
            <span className="text-gold">Venues</span>
          </>
        }
        intro="Every competition site. Tap a map link for directions."
      />

      <section className="container py-14 md:py-20">
        {venues.length > 0 && (
          <p className="mb-10 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
            <span className="text-gold-deep">{venues.length}</span> competition site
            {venues.length === 1 ? "" : "s"}
          </p>
        )}
        {venues.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Venues will be posted closer to the meet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => {
              const agg = byVenue.get(norm(v.name));
              return (
              <article key={v.id} className="border border-ink/15 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
                <h2 className="font-display text-2xl font-black uppercase leading-tight tracking-tight">
                  {v.name}
                </h2>
                {v.address && (
                  <p className="mt-2 font-editorial text-base italic text-ink/70">
                    {v.address}
                  </p>
                )}
                {agg && agg.sessions > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55">
                    <span>
                      {agg.sessions} session{agg.sessions === 1 ? "" : "s"} ·{" "}
                      {agg.sports.size} sport{agg.sports.size === 1 ? "" : "s"}
                    </span>
                    <Link
                      href="/schedule"
                      className="text-gold-deep transition hover:text-ink"
                    >
                      See schedule →
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
                    No sessions scheduled yet
                  </p>
                )}
                {v.map_url && (
                  <a
                    href={v.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 border border-ink/25 px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/70 transition hover:border-gold-deep hover:text-gold-deep"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Directions
                  </a>
                )}
              </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
