import type { Metadata } from "next";
import Link from "next/link";
import {
  Sun,
  Hotel,
  Utensils,
  Camera,
  Bus,
  Map as MapIcon,
  Phone,
  Users,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { PUBLIC_NAV_GROUPS, isNavGroup, type NavLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Host Municipality",
  description:
    "Everything you need to know about Guimbal, Iloilo — host of the FCDSA Meet 2026.",
};

export const revalidate = 300;

// Derive the host links from the "Host" group so the index never drifts.
const HOST_ITEMS: readonly NavLink[] =
  (PUBLIC_NAV_GROUPS.find((e) => isNavGroup(e) && e.label === "Host") as
    | { items: readonly NavLink[] }
    | undefined)?.items ?? [];

// Per-section icon + one-line blurb, keyed by href.
const META: Record<string, { icon: LucideIcon; blurb: string }> = {
  "/host/overview": {
    icon: Sun,
    blurb: "Guimbal, the Town of the Rising Sun & Sons — history & heritage.",
  },
  "/host/accommodation": {
    icon: Hotel,
    blurb: "Beach resorts, inland retreats, poblacion inns & city hotels.",
  },
  "/host/food-dining": {
    icon: Utensils,
    blurb: "Fresh Panay Gulf seafood, Guimbal mangoes & Ilonggo classics.",
  },
  "/host/tourist-spots": {
    icon: Camera,
    blurb: "Centuries-old church, Moro watchtowers, steel bridge & beaches.",
  },
  "/host/transportation": {
    icon: Bus,
    blurb: "Getting here & around — buses, jeepneys, tricycles & route guide.",
  },
  "/host/map": {
    icon: MapIcon,
    blurb: "Find your way around the poblacion & competition sites.",
  },
  "/host/emergency": {
    icon: Phone,
    blurb: "Essential numbers — hospital, police, fire & local responders.",
  },
  "/host/committees": {
    icon: Users,
    blurb: "The organizing team making this meet happen.",
  },
};

export default async function HostHubPage() {
  const supabase = createClient();

  // Cheap head-only counts for the two DB-backed sections.
  const [emergency, committees] = await Promise.all([
    supabase
      .from("emergency_contacts")
      .select("*", { count: "exact", head: true }),
    supabase.from("committees").select("*", { count: "exact", head: true }),
  ]);

  const counts: Record<string, string> = {};
  if (emergency.count !== null) {
    counts["/host/emergency"] = `${emergency.count} emergency contact${
      emergency.count === 1 ? "" : "s"
    }`;
  }
  if (committees.count !== null) {
    counts["/host/committees"] = `${committees.count} committee${
      committees.count === 1 ? "" : "s"
    }`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Host Municipality"
        title={
          <>
            Guimbal{" "}
            <span className="text-gold">Guide</span>
          </>
        }
        intro="Your visitor's handbook to the host town — where to stay, what to eat, what to see, and how to get around during the FCDSA Meet 2026."
      />

      <section className="container py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOST_ITEMS.map((item) => {
            const meta = META[item.href];
            const Icon = meta?.icon ?? Sun;
            const count = counts[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col border border-ink/15 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-ink/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center border border-gold/30 transition-colors group-hover:border-gold/60">
                    <Icon className="h-5 w-5 text-gold-deep" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
                </div>

                <h2 className="mt-5 font-display text-xl font-black uppercase leading-tight tracking-tight">
                  {item.label}
                </h2>
                <p className="mt-2 flex-1 font-editorial text-sm leading-relaxed text-ink/65">
                  {meta?.blurb}
                </p>

                {count && (
                  <p className="mt-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                    {count}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
