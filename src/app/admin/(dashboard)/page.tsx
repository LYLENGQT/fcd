import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection } from "@/components/admin/admin-ui";
import { TallyTable } from "@/components/tally-table";
import { getTally } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const ACTIVITY_VERB: Record<string, string> = {
  insert: "Created",
  update: "Edited",
  delete: "Removed",
};

/** Short relative time, e.g. "3h ago", "2d ago", or a date for older items. */
function shortTime(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDateTime(iso);
}

type ActivityRow = {
  id: number;
  action: string;
  entity: string;
  created_at: string;
};

type FeedbackRow = {
  id: string;
  name: string;
  subject: string;
  created_at: string;
};

type EventResultRow = { id: string; results: { count: number }[] };

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

  const [counts, tally, eventsRes, activityRes, feedbackRes] = await Promise.all([
    Promise.all(
      cards.map(async (c) => {
        const { count } = await supabase
          .from(c.key)
          .select("*", { count: "exact", head: true });
        return { ...c, count: count ?? 0 };
      })
    ),
    getTally(),
    supabase.from("events").select("id, results(count)"),
    supabase
      .from("audit_log")
      .select("id, action, entity, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("feedback")
      .select("id, name, subject, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const events = (eventsRes.data ?? []) as unknown as EventResultRow[];
  const totalEvents = events.length;
  const encoded = events.filter((e) => (e.results?.[0]?.count ?? 0) > 0).length;
  const pct = totalEvents > 0 ? Math.round((encoded / totalEvents) * 100) : 0;

  const activity = (activityRes.data ?? []) as ActivityRow[];
  const recentFeedback = (feedbackRes.data ?? []) as FeedbackRow[];

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
        <div className="border border-ink/15 bg-bone px-6 py-6">
          <div className="flex items-end justify-between gap-4">
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
              Encoding Progress
            </p>
            <p className="font-mono-data text-[11px] tabular-nums text-ink/70">
              {encoded} / {totalEvents} events adjudicated · {pct}%
            </p>
          </div>
          <div
            className="mt-4 h-2 w-full overflow-hidden bg-ink/15"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-ink/15 bg-ink/15 md:grid-cols-2">
          <div className="bg-bone px-6 py-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                Latest Activity
              </p>
              <Link
                href="/admin/audit"
                className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45 hover:text-gold-deep"
              >
                View log →
              </Link>
            </div>
            {activity.length > 0 ? (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-baseline justify-between gap-4">
                    <Link
                      href="/admin/audit"
                      className="font-display text-sm font-bold uppercase tracking-tight hover:text-gold-deep"
                    >
                      {ACTIVITY_VERB[a.action] ?? a.action}{" "}
                      <span className="text-ink/55">{a.entity}</span>
                    </Link>
                    <span className="shrink-0 font-mono-data text-[10px] text-ink/45">
                      {shortTime(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-editorial text-sm italic text-ink/45">
                No activity recorded yet.
              </p>
            )}
          </div>

          <div className="bg-bone px-6 py-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                Recent Feedback
              </p>
              <Link
                href="/admin/feedback"
                className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45 hover:text-gold-deep"
              >
                View inbox →
              </Link>
            </div>
            {recentFeedback.length > 0 ? (
              <ul className="space-y-3">
                {recentFeedback.map((f) => (
                  <li key={f.id}>
                    <Link href="/admin/feedback" className="group block">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-display text-sm font-bold uppercase tracking-tight group-hover:text-gold-deep">
                          {f.name || "Anonymous"}
                        </span>
                        <span className="shrink-0 font-mono-data text-[10px] text-ink/45">
                          {shortTime(f.created_at)}
                        </span>
                      </div>
                      <span className="block truncate font-editorial text-sm text-ink/70">
                        {f.subject || "(no subject)"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-editorial text-sm italic text-ink/45">
                No feedback yet.
              </p>
            )}
          </div>
        </div>

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
