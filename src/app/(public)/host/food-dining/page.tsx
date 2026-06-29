import type { Metadata } from "next";
import Link from "next/link";
import { Fish, Apple, Coffee, Flame } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Food & Dining",
  description: "Where to eat in Guimbal — fresh seafood, Ilonggo dishes, mangoes, and beachfront dining.",
};

export default function FoodDiningPage() {
  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Where to Eat"
        title={
          <>
            Food &amp;
            <br />
            <span className="text-gold">Dining</span>
          </>
        }
        intro="Fresh seafood, homegrown mangoes, and the warmth of Ilonggo hospitality — every meal tells a story."
      />

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          {/* ── Fresh Seafood ──────────────────────────────────────── */}
          <div className="grid items-center gap-8 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Fish className="h-4 w-4 text-gold" /> Daily Catch
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Fresh Seafood
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                Caught daily from Panay Gulf: blue crab (alimango), squid,
                milkfish (bangus), and shellfish. Most resorts and beachfront
                eateries serve them grilled over charcoal, steamed, or cooked
                in sinigang broth — best enjoyed within sight of the water.
              </p>
            </div>
            <div className="relative overflow-hidden border border-ink/15" style={{ background: "linear-gradient(135deg, hsl(var(--cyan)/0.1), hsl(var(--jade)/0.15))" }}>
              <div className="flex aspect-square items-center justify-center">
                <Fish className="h-14 w-14 text-jade/40" />
              </div>
              <p className="absolute bottom-3 left-3 font-mono-data text-[9px] uppercase tracking-[0.15em] text-jade/50">
                Panay Gulf Catch
              </p>
            </div>
          </div>

          {/* ── Guimbal Mangoes ─────────────────────────────────────── */}
          <div className="grid items-center gap-8 sm:grid-cols-3">
            <div className="relative overflow-hidden border border-ink/15 order-last sm:order-first" style={{ background: "linear-gradient(135deg, hsl(var(--gold)/0.15), hsl(var(--gold-deep)/0.12))" }}>
              <div className="flex aspect-square items-center justify-center">
                <Apple className="h-14 w-14 text-gold-deep/40" />
              </div>
              <p className="absolute bottom-3 left-3 font-mono-data text-[9px] uppercase tracking-[0.15em] text-gold-deep/50">
                Guimbal Orchards
              </p>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
                <Apple className="h-4 w-4 text-gold" /> Local Pride
              </div>
              <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
                Guimbal Mangoes
              </h2>
              <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
                The town is one of Iloilo&rsquo;s top mango producers. During
                the October meet, find sweet ripe mangoes, green mango with
                bagoong (shrimp paste), and mango-based desserts at the public
                market. The best mangoes come from hillside orchards in the
                southern barangays.
              </p>
            </div>
          </div>

          {/* ── Ilonggo Classics ────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Flame className="h-4 w-4 text-gold" /> Ilonggo Classics
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Batchoy &amp; Kakanin
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/75">
              Iloilo&rsquo;s signature noodle soup — La Paz Batchoy — with
              pork offal, crushed chicharon, and rich broth is available at
              local eateries in the poblacion. For breakfast, grab native
              kakanin — suman, ibos, kutsinta — from the public market, best
              paired with native hot chocolate (tablea) or Kapeng Barako.
            </p>
          </div>

          {/* ── Where to Eat ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/45">
              <Coffee className="h-4 w-4 text-gold" /> Dining Areas
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.9] tracking-tight">
              Where to Eat
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
                <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                  Beachfront Eateries
                </h3>
                <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                  Casual dining spots along the coast serving grilled seafood
                  and cold drinks with a view of Panay Gulf. Perfect for
                  post-game team dinners.
                </p>
              </div>
              <div className="border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
                <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                  Poblacion Carinderias
                </h3>
                <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                  Affordable home-cooked meals near the plaza and public
                  market. Adobo, sinigang, grilled fish, fresh vegetables.
                  Authentic and budget-friendly.
                </p>
              </div>
              <div className="border border-ink/15 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
                <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                  Municipal Food Park
                </h3>
                <p className="mt-2 font-editorial text-sm leading-relaxed text-ink/65">
                  Multiple food stalls near the town center offering grilled
                  items, burgers, shawarma, and refreshments. Open evenings
                  during the meet.
                </p>
              </div>
            </div>
          </div>

          {/* ── Related ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/15 pt-6">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
              Related
            </span>
            {[
              { href: "/host/map", label: "Map" },
              { href: "/host/accommodation", label: "Accommodation" },
              { href: "/host/tourist-spots", label: "Tourist Spots" },
            ].map((r, i) => (
              <span key={r.href} className="flex items-center gap-3">
                {i > 0 && <span className="text-ink/20">·</span>}
                <Link
                  href={r.href}
                  className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
                >
                  {r.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
