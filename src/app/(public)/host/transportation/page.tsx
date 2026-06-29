import type { Metadata } from "next";
import Link from "next/link";
import { Bus, Bike, Footprints, Car } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Transportation",
  description: "How to get to Guimbal and around town — buses, jeepneys, tricycles, and route guides.",
};

export default function TransportationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Getting Here & Around"
        title={
          <>
            Transpor<span className="text-gold">tation</span>
          </>
        }
        intro="A 45-minute drive from Iloilo City. Well-connected by bus, jeepney, and tricycle — getting to the venues is straightforward."
      />

      {/* ── From Iloilo City ────────────────────────────────────────── */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-16">
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Bus className="h-4 w-4 text-gold" /> Arriving
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              From Iloilo City
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              Guimbal is a 45-minute drive southwest of Iloilo City via the
              Iloilo-Antique Road. The highway is paved and well-maintained
              throughout.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-4 border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30">
                  <Bus className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                    By Bus
                  </h3>
                  <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                    Ceres buses on the Iloilo-Antique and Iloilo-San Joaquin
                    routes pass through Guimbal. Board at Molo or Mohon
                    terminal. Travel: ~45&ndash;60 min. Fare: PHP 50&ndash;80.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30">
                  <Bus className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                    By Jeepney
                  </h3>
                  <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                    Iloilo City&ndash;Guimbal jeepneys depart from Mohon
                    Terminal throughout the day. Slightly slower but more
                    frequent. Travel: ~60&ndash;75 min.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border border-ink/15 p-5 sm:col-span-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30">
                  <Car className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                    By Private Vehicle or Van
                  </h3>
                  <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                    Follow the Iloilo-Antique Road south. After Tigbauan, you
                    enter Guimbal. The municipal hall and plaza are on the right
                    side of the highway. Parking available at municipal grounds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Getting Around ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Bike className="h-4 w-4 text-gold" /> Around Town
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Getting Around Town
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-4 border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30">
                  <Bike className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                    Tricycles
                  </h3>
                  <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                    Over 180 tricycles serve the poblacion and barangays.
                    Primary mode of transport for short trips. Minimum fare
                    within poblacion: PHP 15&ndash;20. Negotiate for longer
                    trips to barangay venues.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30">
                  <Footprints className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                    Walking
                  </h3>
                  <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                    The poblacion is compact and walkable. Plaza, church,
                    municipal hall, and market are within 10&ndash;15 minutes
                    of each other. Most dining spots and inns are nearby.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Route Guide ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Footprints className="h-4 w-4 text-gold" /> Quick Reference
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Route Guide
            </h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse border border-ink/15 font-mono-data text-sm">
                <thead>
                  <tr className="border-b-2 border-ink bg-ink/[0.03]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em]">From</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em]">To</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em]">Mode</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.15em]">Est. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Iloilo City (Mohon)", "Guimbal Poblacion", "Bus / Jeepney", "45–75 min"],
                    ["Guimbal Poblacion", "Beach Resorts", "Tricycle", "5–10 min"],
                    ["Guimbal Poblacion", "Municipal Gym", "Walking / Tricycle", "5 / 2 min"],
                    ["Guimbal", "Miag-ao", "Bus / Jeepney", "15–20 min"],
                    ["Guimbal", "Tigbauan", "Bus / Jeepney", "10–15 min"],
                    ["Guimbal", "Iloilo City (hotels)", "Bus / Jeepney", "45–75 min"],
                  ].map(([from, to, mode, time], i) => (
                    <tr key={i} className="border-b border-ink/10 last:border-0">
                      <td className="px-4 py-2.5 tabular-nums">{from}</td>
                      <td className="px-4 py-2.5">{to}</td>
                      <td className="px-4 py-2.5">{mode}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Parking ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Car className="h-4 w-4 text-gold" /> Parking
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Parking Zones
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              Designated parking areas will be marked near each competition
              venue. The municipal grounds and plaza area have public parking.
              Look for FCDSA Meet 2026 signage for official zones. Delegation
              vehicles and vans will have reserved areas at primary venues. See
              the{" "}
              <Link
                href="/venues"
                className="text-gold-deep underline underline-offset-4 hover:text-gold"
              >
                Venues
              </Link>{" "}
              directory for each competition site.
            </p>
          </div>

          {/* ── Related ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/15 pt-6">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
              Related
            </span>
            <Link
              href="/venues"
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
            >
              Venues
            </Link>
            <span className="text-ink/20">·</span>
            <Link
              href="/host/accommodation"
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
            >
              Accommodation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
