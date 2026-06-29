import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Anchor, Building2, Sun, Binoculars, Cog } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BLUR_DATA_URL } from "@/lib/blur";
import { PhotoCarousel, type CarouselSlide } from "./photo-carousel";

// Church photos for the Heritage carousel — one visible at a time, swipeable.
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
  title: "Overview",
  description:
    "Welcome to Guimbal, Iloilo — host municipality of the FCDSA Meet 2026.",
};

export default function HostOverviewPage() {
  return (
    <>
      <ScrollReveal />
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

      {/* ── Heritage (Church) ────────────────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div data-reveal className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Sun className="h-4 w-4 text-gold" /> Heritage
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight md:text-4xl">
              A Town Steeped in History
            </h2>
            <div className="mt-6 space-y-4 font-editorial text-lg leading-relaxed text-ink/75">
              <p>
                Guimbal&rsquo;s crown jewel is the 400-year-old{" "}
                <strong className="font-semibold text-ink">St. Nicholas of Tolentino Parish Church</strong>
                {" "}— built from yellow adobe (<em>igang</em>) and coral stone, it is
                one of the oldest churches in the Philippines. Its weathered facade,
                bell tower, and floral-carved portal have anchored the poblacion
                since the Augustinians established the town&rsquo;s first convent in
                1590.
              </p>
              <p>
                Step inside and the stone austerity gives way to a towering,
                hand-carved hardwood <em>retablo</em> crowned by the all-seeing eye
                — the spiritual heart of Guimbal, and still the center of daily Mass
                beneath a soaring wooden ceiling.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <PhotoCarousel slides={CHURCH_PHOTOS} />
            <p className="mt-3 text-center font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/35">
              St. Nicholas of Tolentino Parish Church · swipe to explore →
            </p>
          </div>
        </div>
      </section>

      {/* ── Bantayan: Moro Watchtowers ───────────────────────────────── */}
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
                  Strung along Guimbal&rsquo;s shoreline stand the{" "}
                  <strong className="font-semibold text-ink">bantayan</strong> —
                  17th-century stone watchtowers raised to warn the town of raiding
                  Moro pirates who once looted the coast and seized natives for the
                  slave markets of the south.
                </p>
                <p>
                  Built from coral stone bound with a lime-and-egg-white mortar — a
                  Spanish technique proven to withstand centuries of storms — they
                  served as lookouts and refuges. Of the original four, three
                  survive, restored by the Department of Tourism, and they give the
                  town&rsquo;s yearly{" "}
                  <strong className="font-semibold text-ink">Bantayan Festival</strong>{" "}
                  its name.
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

      {/* ── Guimbal Steel Bridge ─────────────────────────────────────── */}
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
                At the edge of the poblacion, a steel truss bridge spans the Guimbal
                River — completed in{" "}
                <strong className="font-semibold text-ink">1931</strong> during the
                American period. Its girders were forged from Pittsburgh steel
                shipped in from Virginia, USA, earning it the original name the{" "}
                <strong className="font-semibold text-ink">&ldquo;Virginia Bridge.&rdquo;</strong>
              </p>
              <p>
                Roughly{" "}
                <strong className="font-semibold text-ink">348 meters</strong> across
                seven steel spans, it remains the longest steel bridge in Western
                Visayas. Its sunburst arch — <em>&ldquo;Guimbal, Our Little Hometown ·
                The Town of the Rising Sun &amp; Sons&rdquo;</em> — is the town&rsquo;s
                most-photographed welcome.
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

      {/* ── Landmarks Gallery ────────────────────────────────────────── */}
      <section className="border-t border-ink/15 bg-bone-2/30">
        <div className="container py-14 md:py-20">
          <h2 className="text-center font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Around <span className="text-gold">Town</span>
          </h2>
          <div data-reveal className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2">
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
                { href: "/host/accommodation", label: "Accommodation" },
                { href: "/host/food-dining", label: "Food & Dining" },
                { href: "/host/tourist-spots", label: "Tourist Spots" },
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
