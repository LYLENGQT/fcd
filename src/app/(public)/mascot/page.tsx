import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Sparkles } from "lucide-react";
import type { Mascot } from "@/lib/database.types";

export const metadata = {
  title: "The Mascot",
  description: "Meet the official mascot of the FCDSA Meet 2026.",
};

export const revalidate = 300;

export default async function MascotPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("mascot")
    .select("*")
    .limit(1)
    .maybeSingle();
  const mascot = data as Mascot | null;
  const hasContent =
    !!mascot && !!(mascot.name || mascot.image_url || mascot.description);

  return (
    <>
      <PageHeader
        eyebrow="Meet Identity · The Spirit of the Games"
        title={
          <>
            The <span className="text-gold">Mascot</span>
          </>
        }
        intro="Every meet has a face — a symbol of the spirit the athletes carry into the arena."
      />

      <section className="container py-14 md:py-20">
        {!hasContent ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            The mascot will be unveiled closer to the meet.
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2">
            <div>
              {mascot!.image_url ? (
                <div className="overflow-hidden border border-ink/15 bg-bone-2/40">
                  <Image
                    src={mascot!.image_url}
                    alt={mascot!.name || "Meet mascot"}
                    width={800}
                    height={800}
                    className="aspect-square w-full object-contain"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-square items-center justify-center border border-ink/15"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--gold)/0.14), hsl(var(--jade)/0.12))",
                  }}
                >
                  <Sparkles className="h-16 w-16 text-gold/40" />
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-4xl font-black uppercase leading-[0.9] tracking-tight md:text-5xl">
                {mascot!.name || "The Meet Mascot"}
              </h2>
              {mascot!.tagline && (
                <p className="mt-3 font-editorial text-xl italic text-gold-deep">
                  {mascot!.tagline}
                </p>
              )}
              {mascot!.description && (
                <div className="mt-6 whitespace-pre-line font-editorial text-lg leading-relaxed text-ink/75">
                  {mascot!.description}
                </div>
              )}
              {mascot!.symbolism && (
                <div className="mt-8 border-l-2 border-gold pl-5">
                  <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                    <Sparkles className="h-3.5 w-3.5 text-gold" /> Symbolism
                  </div>
                  <p className="mt-2 whitespace-pre-line font-editorial text-base leading-relaxed text-ink/70">
                    {mascot!.symbolism}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
