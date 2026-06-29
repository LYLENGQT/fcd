import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalTag } from "@/components/medals";
import { StatusPill } from "@/components/status-pill";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { formatDate } from "@/lib/utils";
import type { MedalKind, ScheduleStatus } from "@/lib/database.types";

export const revalidate = 30;

type EventDetail = {
  id: string;
  name: string;
  type: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
};

async function getEvent(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, type, sports(name), categories(name)")
    .eq("id", id)
    .single();
  return data as unknown as EventDetail | null;
}

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const e = await getEvent(params.eventId);
  return { title: e ? `${e.sports?.name} — ${e.name}` : "Result" };
}

type ResultRow = {
  id: string;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  delegations: { name: string; abbrev: string; slug: string; color: string } | null;
  athletes: { id: string; first_name: string; last_name: string } | null;
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

export default async function ResultDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEvent(params.eventId);
  if (!event) notFound();

  const supabase = createClient();
  const { data } = await supabase
    .from("results")
    .select(
      "id, placement, medal, mark, delegations(name, abbrev, slug, color), athletes(id, first_name, last_name)"
    )
    .eq("event_id", params.eventId)
    .order("placement", { ascending: true });

  const results = (data ?? []) as unknown as ResultRow[];

  // Podium cells derived purely from the results already in scope.
  const podium = (["gold", "silver", "bronze"] as const)
    .map((medal) => ({ medal, row: results.find((r) => r.medal === medal) }))
    .filter((p) => p.row);

  // Cheap schedule lookup for a "Held … · venue" line (event_id is the FK).
  const { data: scheduleData } = await supabase
    .from("schedules")
    .select("start_at, venue, status")
    .eq("event_id", params.eventId)
    .order("start_at")
    .limit(1)
    .maybeSingle();
  const schedule = scheduleData as
    | { start_at: string; venue: string; status: ScheduleStatus }
    | null;

  return (
    <>
      <RealtimeRefresher table="results" />
      <PageHeader
        back={{ href: "/results", label: "All Results" }}
        eyebrow={`${event.categories?.name ?? ""} · ${event.type}`}
        title={
          <>
            {event.sports?.name}
            <br />
            <span className="text-gold">{event.name}</span>
          </>
        }
      />

      <section className="container py-14 md:py-20">
        {schedule && (
          <div className="mb-8 flex flex-wrap items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60">
            <span>
              Held {formatDate(schedule.start_at)}
              {schedule.venue ? ` · ${schedule.venue}` : ""}
            </span>
            <StatusPill status={schedule.status} />
          </div>
        )}

        {podium.length > 0 && (
          <div className="mb-10 grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-3">
            {podium.map(({ medal, row }) => (
              <div key={medal} className="bg-bone p-5">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
                  <MedalTag medal={medal} />
                </div>
                {row!.delegations ? (
                  <Link
                    href={`/delegations/${row!.delegations.slug}`}
                    className="mt-3 flex items-center gap-2 transition-colors hover:text-gold-deep"
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-sm ring-2 ring-ink/15"
                      style={{ backgroundColor: row!.delegations.color }}
                      aria-hidden
                    />
                    <span className="font-display text-lg font-bold uppercase leading-tight tracking-wide">
                      {row!.delegations.name}
                    </span>
                  </Link>
                ) : (
                  <div className="mt-3 font-display text-lg font-bold uppercase tracking-wide text-ink/45">
                    —
                  </div>
                )}
                <div className="mt-1 font-mono-data text-sm tabular-nums text-ink/60">
                  {row!.mark ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No podium recorded for this event yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink/12 border-y-2 border-ink">
            <li className="grid grid-cols-12 items-center gap-x-4 py-3 font-mono-data text-[10px] uppercase tracking-[0.22em] text-ink/45">
              <div className="col-span-2 md:col-span-1">Place</div>
              <div className="col-span-10 md:col-span-5">Delegation</div>
              <div className="col-span-6 md:col-span-3">Athlete</div>
              <div className="col-span-3 md:col-span-2">Mark</div>
              <div className="col-span-3 justify-self-end md:col-span-1">Medal</div>
            </li>
            {results.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-12 items-center gap-x-4 gap-y-1 py-5 transition-colors hover:bg-ink/[0.04]"
              >
                <div className="col-span-2 font-display text-3xl font-black leading-none md:col-span-1">
                  {ordinal(r.placement)}
                </div>
                <div className="col-span-10 md:col-span-5">
                  {r.delegations ? (
                    <Link
                      href={`/delegations/${r.delegations.slug}`}
                      className="flex items-center gap-2 transition-colors hover:text-gold-deep"
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-sm ring-2 ring-ink/15"
                        style={{ backgroundColor: r.delegations.color }}
                        aria-hidden
                      />
                      <span className="font-display text-xl font-bold uppercase tracking-wide">
                        {r.delegations.name}
                      </span>
                    </Link>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="col-span-6 font-editorial text-base text-ink/70 md:col-span-3">
                  {r.athletes ? (
                    <Link
                      href={`/athletes/${r.athletes.id}`}
                      className="transition-colors hover:text-gold-deep hover:underline"
                    >
                      {r.athletes.first_name} {r.athletes.last_name}
                    </Link>
                  ) : (
                    "Team"
                  )}
                </div>
                <div
                  className="col-span-3 font-mono-data text-sm tabular-nums text-ink/60 md:col-span-2"
                  title="Result mark (time / distance / score)"
                >
                  {r.mark ?? "—"}
                </div>
                <div className="col-span-3 justify-self-end md:col-span-1">
                  <MedalTag medal={r.medal} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
