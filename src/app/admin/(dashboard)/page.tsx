import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection } from "@/components/admin/admin-ui";
import { TallyTable } from "@/components/tally-table";
import { getTally } from "@/lib/queries";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const supabase = createClient();

  const cards = [
    { key: "delegations", label: "Delegations", href: "/admin/delegations" },
    { key: "athletes", label: "Athletes", href: "/admin/athletes" },
    { key: "sports", label: "Sports", href: "/admin/sports" },
    { key: "events", label: "Events", href: "/admin/events" },
    { key: "results", label: "Results", href: "/admin/results" },
    { key: "schedules", label: "Scheduled", href: "/admin/schedule" },
    { key: "announcements", label: "Bulletins", href: "/admin/announcements" },
    { key: "livestreams", label: "Feeds", href: "/admin/livestreams" },
  ] as const;

  const [counts, tally] = await Promise.all([
    Promise.all(
      cards.map(async (c) => {
        const { count } = await supabase
          .from(c.key)
          .select("*", { count: "exact", head: true });
        return { ...c, count: count ?? 0 };
      })
    ),
    getTally(),
  ]);

  return (
    <>
      <PageHeader
        watermark="Dashboard"
        eyebrow="Control Desk · Overview"
        title={
          <>
            The
            <br />
            <span className="text-gold">Dashboard</span>
          </>
        }
        intro="Meet data at a glance. Jump to any section, or watch the tally derive itself from encoded results."
      />

      <AdminSection className="space-y-12">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-4">
          {counts.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="group bg-bone px-5 py-6 transition-colors hover:bg-highlight hover:text-on-highlight"
            >
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55 group-hover:text-on-highlight/60">
                {c.label}
              </p>
              <p className="mt-2 font-display text-4xl font-black tabular-nums">
                {c.count}
              </p>
            </Link>
          ))}
        </div>

        <div>
          <header className="mb-5 flex items-end justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
              Medal Tally
            </h2>
            <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
              Auto-derived from results
            </span>
          </header>
          <TallyTable rows={tally} />
        </div>
      </AdminSection>
    </>
  );
}
