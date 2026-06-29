import type { Metadata } from "next";
import Link from "next/link";
import { Church, Binoculars, Cog, LandPlot, Landmark, Waves, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Tourist Spots",
  description:
    "Explore Guimbal — centuries-old church, Moro watchtowers, historic steel bridge, beaches, and more.",
};

export default function TouristSpotsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Things to See"
        title={
          <>
            Tourist
            <br />
            <span className="text-gold">Spots</span>
          </>
        }
        intro="Between games, explore centuries-old watchtowers, a steel bridge ordered by a U.S. president, and the golden shoreline of Panay Gulf."
      />

      {/* ── Church ───────────────────────────────────────────────────── */}
      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden border border-ink/15">
            <div
              className="flex aspect-[16/9] w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--ink)/0.08), hsl(var(--gold)/0.14))",
              }}
            >
              <Church className="h-20 w-20 text-gold/35" />
            </div>
            <p className="border-t border-ink/15 px-5 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
              St. Nicholas of Tolentino Parish Church · Founded 1590
            </p>
          </div>
        </div>
      </section>

      <section className="pb-14 md:pb-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Church className="h-4 w-4 text-gold" /> 400 Years of Faith
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              St. Nicholas of Tolentino Parish Church
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              Built from yellow adobe and coral stones, this 400-year-old church
              is one of the oldest in the Philippines. The facade and bell tower
              stand as enduring symbols of Guimbal&rsquo;s Spanish colonial
              heritage. Located at the heart of the poblacion beside the Public
              Plaza, mass is celebrated daily.
            </p>
          </div>
        </div>
      </section>

      {/* ── Watchtowers & Bridge ─────────────────────────────────────── */}
      <section className="border-y border-ink/15 bg-bone-2/30 py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-14">
            <div>
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Binoculars className="h-4 w-4 text-gold" /> 17th-Century Sentinels
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Moro Watchtowers
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                Three 17th-century stone watchtowers along the shoreline, built
                to warn the town of Moro pirate raids. Originally four were
                constructed; three remain intact and restored by the Department
                of Tourism. They offer a glimpse into Guimbal&rsquo;s maritime
                past and make for striking photo backdrops at sunset. The towers
                dot the poblacion coastline and are walkable from one another.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Cog className="h-4 w-4 text-gold" /> American-Era Engineering
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Guimbal Steel Bridge
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                The longest steel bridge in Western Visayas, ordered by U.S.
                President Theodore Roosevelt and forged from Pittsburgh steel
                imported from Virginia. Spanning 350 meters across the Guimbal
                River, it remains fully operational — especially photogenic at
                dawn when morning light hits the steel trusses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plaza & Municipal Building ───────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <LandPlot className="h-4 w-4 text-gold" /> The Town&rsquo;s Living Room
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Public Plaza
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              European-inspired gardens with ornamental plants, manicured
              hedges, and lamp-lit walkways. Locals call it the &ldquo;Little
              Luneta of Southern Iloilo.&rdquo; Open day and night — ideal for
              evening strolls, team photos, and casual gatherings. At the very
              center of the poblacion, directly in front of the church.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Landmark className="h-4 w-4 text-gold" /> The Parthenon
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              New Municipal Building
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              An Athenian-inspired structure housing the local government. In
              front stands an open-air coliseum and amphitheatre where cultural
              shows, programs, sports activities, and public gatherings are held
              — including FCDSA Meet ceremonies. Unlike anything else in the
              province.
            </p>
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section className="border-t border-ink/15 bg-bone-2/30">
        <div className="container py-14 md:py-20">
          <h2 className="text-center font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Around <span className="text-gold">Town</span>
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            <div className="overflow-hidden border border-ink/15">
              <div
                className="flex aspect-[3/2] w-full items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--bone-2)), hsl(var(--ink)/0.06))",
                }}
              >
                <Building2 className="h-14 w-14 text-ink/25" />
              </div>
              <p className="px-4 py-2.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                Old Municipal Hall
              </p>
            </div>
            <div className="overflow-hidden border border-ink/15">
              <div
                className="flex aspect-[3/2] w-full items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--gold-deep)/0.1), hsl(var(--gold)/0.12))",
                }}
              >
                <Landmark className="h-14 w-14 text-gold-deep/40" />
              </div>
              <p className="px-4 py-2.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                Parthenon of Western Visayas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beaches ──────────────────────────────────────────────────── */}
      <section className="bg-surface-inv text-on-inv">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-gold">
              <Waves className="h-4 w-4" /> Hidden Gems
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Guimbal Beaches
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-on-inv/80">
              The 9-kilometer shoreline features public and resort beaches with
              fine gray sand, calm waters, and panoramic views of Panay Gulf.
              Day-tour packages with cottage rental and water activities are
              available — ideal for a rest day between events or a team
              celebration by the sea.
            </p>
            <div className="mt-8 space-y-3 font-editorial text-base leading-relaxed text-on-inv/70">
              <p>
                <strong className="font-semibold text-on-inv">Taytay Tigre</strong>
                {""} — a Spanish-era bridge with tiger-shaped stone approaches
                guarding the entrance to the poblacion.
              </p>
              <p>
                <strong className="font-semibold text-on-inv">Ayaw-ayaw Monument</strong>
                {""} — a life-size statue of Andres Bonifacio on a hillside in
                Nahapay, marking where revolutionaries resisted American forces.
              </p>
            </div>

            {/* ── Related ───────────────────────────────────────────────── */}
            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-on-inv/10 pt-6">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/40">
                Related
              </span>
              {[
                { href: "/host/map", label: "Map" },
                { href: "/host/overview", label: "Overview" },
                { href: "/host/transportation", label: "Transportation" },
              ].map((r, i) => (
                <span key={r.href} className="flex items-center gap-3">
                  {i > 0 && <span className="text-on-inv/20">·</span>}
                  <Link
                    href={r.href}
                    className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-on-inv/60 transition-colors hover:text-gold"
                  >
                    {r.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
