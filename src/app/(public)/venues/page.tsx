import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import type { Venue } from "@/lib/database.types";

export const metadata = {
  title: "Venues",
  description: "Where the meet happens — competition sites and directions.",
};

export const revalidate = 300;

export default async function VenuesPage() {
  const supabase = createClient();
  const { data } = await supabase.from("venues").select("*").order("name");
  const venues = (data ?? []) as Venue[];

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
        {venues.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Venues will be posted closer to the meet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => (
              <article key={v.id} className="border border-ink/15 p-6">
                <h2 className="font-display text-2xl font-black uppercase leading-tight tracking-tight">
                  {v.name}
                </h2>
                {v.address && (
                  <p className="mt-2 font-editorial text-base italic text-ink/70">
                    {v.address}
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
            ))}
          </div>
        )}
      </section>
    </>
  );
}
