import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Phone, MapPin } from "lucide-react";
import type { EmergencyContact } from "@/lib/database.types";

export const metadata = {
  title: "Emergency Directory",
  description: "Emergency and essential contact numbers in the host municipality.",
};

export const revalidate = 300;

const ACRONYMS: Record<string, string> = {
  PNP: "Philippine National Police",
  BFP: "Bureau of Fire Protection",
  MDRRMO: "Municipal Disaster Risk Reduction & Management Office",
  RHU: "Rural Health Unit",
};

export default async function EmergencyPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("emergency_contacts")
    .select("*")
    .order("sort_order");

  const contacts = (data ?? []) as EmergencyContact[];

  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Stay Safe"
        title={
          <>
            Emergency{" "}
            <span className="text-gold">Directory</span>
          </>
        }
        intro="Essential numbers and locations. Hospital, police, fire, and local responders."
      />

      <section className="container py-14 md:py-20">
        {contacts.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Emergency contacts will be posted closer to the meet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c) => (
              <article
                key={c.id}
                className="border border-ink/15 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-crimson/20 bg-crimson/5">
                    <Phone className="h-4 w-4 text-crimson" />
                  </div>
                  {c.contact_type && (
                    <span
                      title={ACRONYMS[c.contact_type] ?? undefined}
                      className="rounded border border-ink/15 px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.2em] text-ink/50"
                    >
                      {c.contact_type}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 font-display text-xl font-bold uppercase leading-tight tracking-tight">
                  {c.name}
                </h2>

                {c.contact_number && (
                  <p className="mt-2 font-mono-data text-lg tracking-wide text-ink/80">
                    {c.contact_number}
                  </p>
                )}

                {c.address && (
                  <div className="mt-3 flex items-start gap-1.5 font-editorial text-sm italic leading-relaxed text-ink/60">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {c.address}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* ── Related ─────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/15 pt-6">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
            Related
          </span>
          <Link
            href="/host/committees"
            className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
          >
            Committees
          </Link>
          <span className="text-ink/20">·</span>
          <Link
            href="/host/accommodation"
            className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
          >
            Accommodation
          </Link>
        </div>
      </section>
    </>
  );
}
