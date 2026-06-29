import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MapPin } from "lucide-react";
import type { HostMap } from "@/lib/database.types";

export const metadata = {
  title: "Map (Poblacion)",
  description: "Find your way around the host municipality poblacion.",
};

export const revalidate = 300;

// Cross-links to sibling sections, shown in the closing "Related" row.
const RELATED: { href: string; label: string }[] = [
  { href: "/host/transportation", label: "Transportation" },
  { href: "/host/tourist-spots", label: "Tourist Spots" },
  { href: "/host/accommodation", label: "Accommodation" },
  { href: "/host/emergency", label: "Emergency" },
  { href: "/venues", label: "Venues" },
];

export default async function HostMapPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("host_map")
    .select("*")
    .limit(1)
    .maybeSingle();

  const map = data as HostMap | null;
  const embedUrl = map?.embed_url ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Getting Around"
        title={
          <>
            Map{" "}
            <span className="text-gold">(Poblacion)</span>
          </>
        }
        intro="Key landmarks, competition sites, and public routes in the poblacion."
      />

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* ── Map embed (or empty-state notice) ─────────────────────── */}
          {!embedUrl ? (
            <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
              Map will be posted closer to the meet.
            </div>
          ) : (
            <>
              <div className="overflow-hidden border border-ink/15">
                <iframe
                  src={embedUrl}
                  title="Host Municipality Poblacion Map"
                  className="aspect-video w-full"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
              <p className="mt-3 text-center font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Map not showing?{" "}
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-deep underline underline-offset-4 hover:text-gold"
                >
                  Open in new tab ↗
                </a>
              </p>
            </>
          )}

          {/* ── Context cards — always rendered ───────────────────────── */}
          <div className="mt-10 border-t border-ink/15 pt-10">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight">
              The Poblacion
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="border border-ink/15 p-6">
                <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/55">
                  <MapPin className="h-3.5 w-3.5" />
                  About the Area
                </div>
                <p className="mt-3 font-editorial text-base leading-relaxed text-ink/75">
                  The poblacion serves as the commercial and administrative
                  center of the host municipality. Most competition venues,
                  accommodations, and dining establishments are concentrated
                  here, making it the hub of meet activity.
                </p>
              </div>
              <div className="border border-ink/15 p-6">
                <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/55">
                  <MapPin className="h-3.5 w-3.5" />
                  Getting Around
                </div>
                <p className="mt-3 font-editorial text-base leading-relaxed text-ink/75">
                  Tricycles are the primary mode of transport within the
                  poblacion. Major roads connect to surrounding barangays. See
                  the{" "}
                  <Link
                    href="/host/transportation"
                    className="text-gold-deep underline underline-offset-4 hover:text-gold"
                  >
                    Transportation page
                  </Link>{" "}
                  for detailed routes and fare guides.
                </p>
              </div>
            </div>
          </div>

          {/* ── Related ───────────────────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/15 pt-6">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
              Related
            </span>
            {RELATED.map((r, i) => (
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
