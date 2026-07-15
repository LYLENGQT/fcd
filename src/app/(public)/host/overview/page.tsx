import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Anchor, Building2, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { BLUR_DATA_URL } from "@/lib/blur";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Welcome to Guimbal, Iloilo — host municipality of the FCDSA Meet 2026.",
};

export default function HostOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Host Municipality"
        title={
          <>
            Guimbal
            <br />
            <span className="text-gold">Iloilo</span>
          </>
        }
        intro="The Town of the Rising Sun & Sons — proud host of the First Congressional District Sports Association Meet 2026."
      />

      {/* ── Hero Image ───────────────────────────────────────────────── */}
      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-4xl overflow-hidden border border-ink/15">
          <Image
            src="/host/guimbal-poblacion.jpg"
            alt="Aerial view of Guimbal poblacion — the parish church, public plaza, and Panay Gulf"
            width={1536}
            height={639}
            className="h-auto w-full ken-burns"
            sizes="(min-width: 896px) 896px, 100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority
          />
          <p className="border-t border-ink/15 px-5 py-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
            Guimbal poblacion · the parish church, public plaza &amp; Panay Gulf
          </p>
        </div>
      </section>

      {/* ── Welcome ──────────────────────────────────────────────────── */}
      <section className="pb-10 md:pb-14">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="font-editorial text-xl leading-relaxed text-ink/80">
              Welcome to{" "}
              <strong className="font-semibold text-ink">Guimbal, Iloilo</strong>
              {""} — a coastal town where history, culture, and athletic spirit
              converge. Nestled along the Panay Gulf, 29 kilometers southwest of
              Iloilo City, Guimbal opens its arms to athletes, coaches, and
              spectators from across the First Congressional District for the
              FCDSA Meet 2026.
            </p>
            <p className="mt-6 font-editorial text-lg leading-relaxed text-ink/70">
              Guimbal traces its roots to 1590, when Augustinian missionaries
              established the first convent here. The town&rsquo;s name comes from
              the <em>guimba</em> — a drum used to warn the community of Moro
              pirate raids. That spirit of vigilance, unity, and resilience still
              beats in the heart of every Guimbalanon today.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Facts Grid ─────────────────────────────────────────── */}
      <section className="border-y border-ink/15 bg-bone-2/50">
        <div className="container py-12 md:py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 border border-ink/10 p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <div>
                <div className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/45">Location</div>
                <p className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-wide">Southern Iloilo</p>
                <p className="mt-0.5 font-editorial text-sm text-ink/60">29 km from Iloilo City</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-ink/10 p-5">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <div>
                <div className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/45">Population</div>
                <p className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-wide">35,129</p>
                <p className="mt-0.5 font-editorial text-sm text-ink/60">2024 census · 33 barangays</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-ink/10 p-5">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <div>
                <div className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/45">Established</div>
                <p className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-wide">1703</p>
                <p className="mt-0.5 font-editorial text-sm text-ink/60">Over 320 years of history</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-ink/10 p-5">
              <Anchor className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <div>
                <div className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/45">Shoreline</div>
                <p className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-wide">9 km</p>
                <p className="mt-0.5 font-editorial text-sm text-ink/60">Fronting the Panay Gulf</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Heritage & landmarks teaser → Tourist Spots ──────────────── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
            Heritage &amp; Landmarks
          </div>
          <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-4xl">
            Four Centuries of Story
          </h2>
          <p className="mt-6 font-editorial text-lg leading-relaxed text-ink/75">
            The 400-year-old St. Nicholas of Tolentino Church, the 17th-century
            Moro watchtowers along the shore, and the 1931 steel bridge — the
            longest in Western Visayas — tell Guimbal&rsquo;s history in stone and
            steel. Explore them, plus the plaza and beaches, on the Tourist Spots
            page.
          </p>
          <Link
            href="/host/tourist-spots"
            className="group mt-8 inline-flex items-center gap-2 border border-ink/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wider text-ink transition hover:border-gold-deep hover:text-gold-deep"
          >
            Explore Tourist Spots
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ── Meet 2026 ────────────────────────────────────────────────── */}
      <section className="border-t border-ink/15 bg-surface-inv text-on-inv">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-gold">
              FCDSA Meet 2026
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-5xl">
              Ready to Host
            </h2>
            <p className="mt-6 font-editorial text-lg leading-relaxed text-on-inv/80">
              Guimbal brings together modern venues, accessible transportation,
              warm hospitality, and a deep sporting tradition. From the newly
              built municipal gymnasium to the open-air amphitheatre at the Town
              Hall, every competition site is ready to welcome the best young
              athletes of the First Congressional District.
            </p>
            <p className="mt-4 font-editorial text-lg leading-relaxed text-on-inv/80">
              With its 9-kilometer shoreline, scenic inland resorts, and a
              community that lives for festivals and celebration, Guimbal
              promises not just a well-run meet — but an unforgettable experience
              for every delegation that carries its colors into the arena.
            </p>
            <div className="mt-8 flex items-center gap-4 border-t border-on-inv/10 pt-6 font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/60">
              <span>Mabuhay</span>
              <span className="h-px w-8 bg-gold" />
              <span>Padayon</span>
            </div>

            {/* ── Related ───────────────────────────────────────────────── */}
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-on-inv/10 pt-6">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/40">
                Explore
              </span>
              {[
                { href: "/host/tourist-spots", label: "Tourist Spots" },
                { href: "/host/accommodation", label: "Accommodation" },
                { href: "/host/food-dining", label: "Food & Dining" },
                { href: "/host/transportation", label: "Transportation" },
                { href: "/host/map", label: "Map" },
                { href: "/venues", label: "Venues" },
                { href: "/schedule", label: "Schedule" },
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
