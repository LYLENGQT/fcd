import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import type { Livestream } from "@/lib/database.types";

export const metadata = {
  title: "Livestream",
  description: "Watch live coverage of the meet.",
};

export const revalidate = 60;

export default async function LivestreamPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("livestreams")
    .select("*")
    .order("is_live", { ascending: false })
    .order("created_at", { ascending: false });

  const streams = (data ?? []) as Livestream[];
  const liveCount = streams.filter((s) => s.is_live).length;

  return (
    <>
      <PageHeader
        index="06"
        eyebrow="Broadcast · Live & Replay"
        title={
          <>
            The
            <br />
            <span className="text-gold">Broadcast</span>
          </>
        }
        intro="Court-side and pool-side feeds. When a venue is on air you will see the crimson light below."
        aside={
          <div className="flex items-center gap-3 border border-on-inv/15 bg-on-inv/10 px-5 py-4">
            <span className="relative flex h-3 w-3">
              {liveCount > 0 && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  liveCount > 0 ? "bg-crimson" : "bg-on-inv/30"
                }`}
              />
            </span>
            <span className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/75">
              {liveCount > 0
                ? `${liveCount} feed${liveCount === 1 ? "" : "s"} on air`
                : "Off air"}
            </span>
          </div>
        }
      />

      <section className="container py-14 md:py-20">
        {streams.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No streams available — feeds appear here when broadcasts begin.
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {streams.map((s) => (
              <figure key={s.id} className="group">
                <div className="relative aspect-video w-full overflow-hidden border border-ink bg-surface-inv">
                  <iframe
                    src={s.embed_url}
                    title={s.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                  {s.is_live && (
                    <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 bg-crimson px-2.5 py-1 font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-bone">
                      <span className="h-1.5 w-1.5 rounded-full bg-bone pulse-dot" />
                      Live
                    </span>
                  )}
                </div>
                <figcaption className="mt-4 flex items-start justify-between gap-4 border-t border-ink/15 pt-4">
                  <h2 className="font-display text-xl font-bold uppercase leading-tight tracking-wide">
                    {s.title}
                  </h2>
                  <span className="flex shrink-0 items-center gap-1.5 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    <Radio className="h-3.5 w-3.5" />
                    {s.platform}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
