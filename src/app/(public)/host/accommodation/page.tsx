import type { Metadata } from "next";
import Link from "next/link";
import { Waves, Hotel, Building, Bed, Landmark } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Accommodation",
  description:
    "Where to stay in Guimbal — beach resorts, inland retreats, poblacion inns, and Iloilo City hotels.",
};

export default function AccommodationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Where to Stay"
        title={
          <>
            Accommod<span className="text-gold">ation</span>
          </>
        }
        intro="From beachfront resorts to simple traveller inns — all within easy reach of the competition venues."
      />

      {/* ── Full-width Banner ────────────────────────────────────────── */}
      <section className="container py-10 md:py-14">
        <div
          className="relative mx-auto flex aspect-[21/9] max-w-4xl items-center justify-center overflow-hidden border border-ink/15"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--ink)/0.08), hsl(var(--gold)/0.14))",
          }}
        >
          <Landmark className="h-16 w-16 text-gold/35" />
          <p className="absolute bottom-3 left-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/35">
            Guimbal · Host Municipality
          </p>
        </div>
      </section>

      {/* ── Beach Resorts ──────────────────────────────────────────── */}
      <section className="pb-14 md:pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="relative overflow-hidden border border-ink/15" style={{ background: "linear-gradient(135deg, hsl(var(--ink)/0.08), hsl(var(--jade)/0.15))" }}>
                  <div className="flex aspect-[3/4] items-center justify-center">
                    <Waves className="h-16 w-16 text-jade/40" />
                  </div>
                  <p className="absolute bottom-3 left-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/35">
                    Panay Gulf Shoreline
                  </p>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                  <Waves className="h-4 w-4 text-gold" /> Beachfront
                </div>
                <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                  Beach Resorts &amp; Cottages
                </h2>
                <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                  Guimbal&rsquo;s 9-kilometer shoreline along Panay Gulf is
                  dotted with resorts offering native-style cottages,
                  air-conditioned rooms, and open-air pavilions. Many have
                  direct beach access, swimming pools, and function halls
                  suitable for team briefings.
                </p>
                <p className="mt-4 font-editorial text-base leading-relaxed text-ink/65">
                  Most beach resorts are a 5&ndash;10 minute tricycle ride
                  from the poblacion. Booking in advance during the meet week
                  is strongly recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inland Resorts ─────────────────────────────────────────── */}
      <section className="border-y border-ink/15 bg-bone-2/30 py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                  <Hotel className="h-4 w-4 text-gold" /> Inland
                </div>
                <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                  Inland Resorts
                </h2>
                <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                  Several inland resorts in the barangays offer a quieter
                  alternative — garden settings, freshwater pools, and hilltop
                  views of Panay Gulf. Ideal for delegations seeking a retreat
                  after competition, away from the bustle of the town center.
                </p>
              </div>
              <div className="lg:col-span-2">
                <div className="relative overflow-hidden border border-ink/15" style={{ background: "linear-gradient(135deg, hsl(var(--gold-deep)/0.1), hsl(var(--gold)/0.12))" }}>
                  <div className="flex aspect-[3/4] items-center justify-center">
                    <Hotel className="h-16 w-16 text-gold/40" />
                  </div>
                  <p className="absolute bottom-3 right-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                    Hillside Retreats
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Poblacion & City ────────────────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="grid items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden border border-ink/15" style={{ background: "linear-gradient(135deg, hsl(var(--bone-2)), hsl(var(--bone)))" }}>
                <div className="flex aspect-[3/4] items-center justify-center">
                  <Building className="h-16 w-16 text-ink/20" />
                </div>
                <p className="absolute bottom-3 left-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  Poblacion District
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Building className="h-4 w-4 text-gold" /> Town Center
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Poblacion Inns &amp; Homestays
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                The town proper has small inns, lodging houses, and homestay
                options within walking distance of the municipal plaza, church,
                and public market. Budget-friendly and convenient for quick
                access to venues.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Bed className="h-4 w-4 text-gold" /> Overflow
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Iloilo City Hotels
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                Guimbal is a 45-minute drive from Iloilo City, where major
                hotels, business inns, and serviced apartments are available.
                Delegations preferring city accommodations can commute via the
                Iloilo-Antique Road — buses and jeepneys ply the route
                regularly throughout the day.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden border border-ink/15" style={{ background: "linear-gradient(135deg, hsl(var(--ink)/0.06), hsl(var(--cyan)/0.12))" }}>
                <div className="flex aspect-[3/4] items-center justify-center">
                  <Bed className="h-16 w-16 text-cyan/40" />
                </div>
                <p className="absolute bottom-3 right-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  Iloilo City · 45 min
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking ──────────────────────────────────────────────────── */}
      <section className="border-t border-ink/15 bg-surface-inv text-on-inv">
        <div className="container py-12 text-center">
          <p className="mx-auto max-w-2xl font-editorial text-lg italic leading-relaxed text-on-inv/70">
            For specific resort names, contact numbers, and booking assistance,
            refer to the{" "}
            <Link
              href="/host/emergency"
              className="text-gold underline underline-offset-4 hover:text-on-inv"
            >
              Emergency Directory
            </Link>{" "}
            or coordinate with the{" "}
            <Link
              href="/host/committees"
              className="text-gold underline underline-offset-4 hover:text-on-inv"
            >
              Host Committee
            </Link>{" "}
            upon arrival.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-on-inv/10 pt-6">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/40">
              Related
            </span>
            <Link
              href="/host/emergency"
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-on-inv/60 transition-colors hover:text-gold"
            >
              Emergency Directory
            </Link>
            <span className="text-on-inv/20">·</span>
            <Link
              href="/host/committees"
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-on-inv/60 transition-colors hover:text-gold"
            >
              Committees
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
