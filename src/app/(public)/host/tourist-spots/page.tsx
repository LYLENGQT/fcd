import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Church, Binoculars, Cog, LandPlot, Landmark, Waves } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BLUR_DATA_URL } from "@/lib/blur";
import { PhotoCarousel, type CarouselSlide } from "../overview/photo-carousel";

// Church photos for the carousel — one visible at a time, swipeable.
const CHURCH_PHOTOS: CarouselSlide[] = [
  { src: "/host/church/church-05.jpg", alt: "Facade and bell tower of St. Nicholas of Tolentino Parish Church" },
  { src: "/host/church/church-06.jpg", alt: "Central nave and tiled aisle" },
  { src: "/host/church/church-04.jpg", alt: "Hand-carved wooden retablo and altar" },
  { src: "/host/church/church-02.jpg", alt: "Detail of the carved hardwood retablo" },
  { src: "/host/church/church-10.jpg", alt: "Weathered stone bell tower" },
  { src: "/host/church/church-08.jpg", alt: "Domed pediment and arched window" },
  { src: "/host/church/church-03.jpg", alt: "Carved hardwood main doors" },
  { src: "/host/church/church-09.jpg", alt: "Retablo with santos and tabernacle" },
  { src: "/host/church/church-07.jpg", alt: "Church facade against a bright sky" },
  { src: "/host/church/church-01.jpg", alt: "Coral-stone side wall and buttresses" },
];

export const metadata: Metadata = {
  title: "Tourist Spots",
  description:
    "Explore Guimbal — a 400-year-old church, Moro watchtowers, a historic steel bridge, the public plaza, beaches, and more.",
};

export default function TouristSpotsPage() {
  return (
    <>
      <ScrollReveal />
      <PageHeader
        eyebrow="Host Municipality · Things to See"
        title={
          <>
            Tourist
            <br />
            <span className="text-gold">Spots</span>
          </>
        }
        intro="Between games, explore a 400-year-old church, coastal watchtowers, a steel bridge forged from Pittsburgh steel, and the golden shoreline of Panay Gulf."
      />

      {/* ── Church (carousel) ────────────────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div data-reveal className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Church className="h-4 w-4 text-gold" /> 400 Years of Faith
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-4xl">
              St. Nicholas of Tolentino Parish Church
            </h2>
            <div className="mt-6 space-y-4 font-editorial text-lg leading-relaxed text-ink/75">
              <p>
                Guimbal&rsquo;s crown jewel is the 400-year-old church — built from
                yellow adobe (<em>igang</em>) and coral stone, it is one of the
                oldest in the Philippines. Its weathered facade, bell tower, and
                floral-carved portal have anchored the poblacion since the
                Augustinians established the town&rsquo;s first convent in 1590.
              </p>
              <p>
                Step inside and the stone austerity gives way to a towering,
                hand-carved hardwood <em>retablo</em> crowned by the all-seeing eye
                — the spiritual heart of Guimbal, beside the Public Plaza, with
                Mass celebrated daily.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <PhotoCarousel slides={CHURCH_PHOTOS} label="St. Nicholas of Tolentino Parish Church photos" />
            <p className="mt-3 text-center font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/35">
              St. Nicholas of Tolentino Parish Church · swipe to explore →
            </p>
          </div>
        </div>
      </section>

      {/* ── Moro Watchtowers ─────────────────────────────────────────── */}
      <section className="border-y border-ink/15 bg-bone-2/30">
        <div className="container py-14 md:py-20">
          <div data-reveal className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Binoculars className="h-4 w-4 text-gold" /> Coastal Sentinels
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-4xl">
              Bantayan · The Moro Watchtowers
            </h2>

            <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden border border-ink/15">
                <Image
                  src="/host/watchtowers/watchtower-03.png"
                  alt="A restored 17th-century Moro watchtower on the Guimbal shoreline"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover ken-burns"
                />
              </div>
              <div className="space-y-4 font-editorial text-lg leading-relaxed text-ink/75">
                <p>
                  Strung along the shoreline stand the{" "}
                  <strong className="font-semibold text-ink">bantayan</strong> —
                  17th-century stone watchtowers raised to warn the town of raiding
                  Moro pirates who once looted the coast.
                </p>
                <p>
                  Built from coral stone bound with a lime-and-egg-white mortar,
                  they served as lookouts and refuges. Of the original four, three
                  survive, restored by the Department of Tourism, and they give the
                  town&rsquo;s yearly{" "}
                  <strong className="font-semibold text-ink">Bantayan Festival</strong>{" "}
                  its name. Especially striking at sunset.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/3] overflow-hidden border border-ink/15">
                <Image
                  src="/host/watchtowers/watchtower-01.jpg"
                  alt="Moss-covered watchtower along the Guimbal baywalk"
                  fill
                  sizes="(min-width: 1024px) 40vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden border border-ink/15">
                <Image
                  src="/host/watchtowers/watchtower-04.png"
                  alt="Stone watchtower overlooking the Panay Gulf"
                  fill
                  sizes="(min-width: 1024px) 40vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steel Bridge ─────────────────────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div data-reveal className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
            <Cog className="h-4 w-4 text-gold" /> American-Era Engineering
          </div>
          <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-4xl">
            The Guimbal Steel Bridge
          </h2>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden border border-ink/15">
            <Image
              src="/host/bridge/bridge-01.jpg"
              alt="The Guimbal steel truss bridge with its golden sunburst arch"
              fill
              sizes="(min-width: 1280px) 1024px, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover ken-burns"
            />
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-4 font-editorial text-lg leading-relaxed text-ink/75">
              <p>
                A steel truss bridge spans the Guimbal River — completed in{" "}
                <strong className="font-semibold text-ink">1931</strong> during the
                American period, its girders forged from Pittsburgh steel shipped in
                from Virginia, USA, earning it the original name the{" "}
                <strong className="font-semibold text-ink">&ldquo;Virginia Bridge.&rdquo;</strong>
              </p>
              <p>
                Roughly <strong className="font-semibold text-ink">348 meters</strong>{" "}
                across seven spans, it remains the longest steel bridge in Western
                Visayas. Its sunburst arch is the town&rsquo;s most-photographed
                welcome — best at dawn, when light hits the trusses.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-ink/15">
              <Image
                src="/host/bridge/bridge-02.jpg"
                alt="Head-on view of the Guimbal bridge sunburst welcome arch"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── In the Poblacion: Plaza + Municipal buildings ────────────── */}
      <section className="border-y border-ink/15 bg-bone-2/30">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                  <LandPlot className="h-4 w-4 text-gold" /> The Town&rsquo;s Living Room
                </div>
                <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight">
                  Public Plaza
                </h2>
                <p className="mt-4 font-editorial text-lg leading-relaxed text-ink/75">
                  European-inspired gardens with ornamental plants, manicured
                  hedges, and lamp-lit walkways — locals call it the &ldquo;Little
                  Luneta of Southern Iloilo.&rdquo; Open day and night, right in
                  front of the church: ideal for evening strolls and team photos.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                  <Landmark className="h-4 w-4 text-gold" /> The Parthenon
                </div>
                <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight">
                  New Municipal Building
                </h2>
                <p className="mt-4 font-editorial text-lg leading-relaxed text-ink/75">
                  An Athenian-inspired structure housing the local government. In
                  front stands an open-air amphitheatre where cultural shows and
                  public gatherings are held — including FCDSA Meet ceremonies.
                </p>
              </div>
            </div>

            {/* Municipal halls gallery — real photos */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <figure className="overflow-hidden border border-ink/15">
                <div className="group sheen relative aspect-[3/2] w-full overflow-hidden">
                  <Image
                    src="/host/municipal/old.jpg"
                    alt="The old Guimbal Municipal Hall — a wood-and-stone colonial-era building"
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <figcaption className="px-4 py-2.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  Old Municipal Hall
                </figcaption>
              </figure>
              <figure className="overflow-hidden border border-ink/15">
                <div className="group sheen relative aspect-[3/2] w-full overflow-hidden">
                  <Image
                    src="/host/municipal/new.jpg"
                    alt="The new Guimbal Municipal Building — the Athenian-inspired Parthenon of Western Visayas"
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <figcaption className="px-4 py-2.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  New Municipal Building · Parthenon of Western Visayas
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beaches & hidden gems ────────────────────────────────────── */}
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
              available — ideal for a rest day between events.
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

            {/* ── Related ─────────────────────────────────────────────── */}
            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-on-inv/10 pt-6">
              <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/40">
                Related
              </span>
              {[
                { href: "/host/overview", label: "Overview" },
                { href: "/host/map", label: "Map" },
                { href: "/host/transportation", label: "Transportation" },
                { href: "/host/accommodation", label: "Accommodation" },
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
