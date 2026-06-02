import { createClient } from "@/lib/supabase/server";
import { ScheduleFilter } from "./schedule-filter";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { formatTime, parsePage, pageRange } from "@/lib/utils";
import type { ScheduleStatus } from "@/lib/database.types";

export const metadata = {
  title: "Schedule",
  description: "Event schedule by day, sport, and venue.",
};

export const revalidate = 60;

type Row = {
  id: string;
  venue: string;
  start_at: string;
  status: ScheduleStatus;
  events: {
    name: string;
    sports: { name: string } | null;
    categories: { name: string } | null;
  } | null;
};

const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: { sport?: string; page?: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("schedules")
    .select("id, venue, start_at, status, events(name, sports(name), categories(name))")
    .order("start_at");

  let rows = (data ?? []) as unknown as Row[];

  const sports = Array.from(
    new Set(rows.map((r) => r.events?.sports?.name).filter(Boolean) as string[])
  ).sort();

  const activeSport = searchParams.sport;
  if (activeSport) {
    rows = rows.filter((r) => r.events?.sports?.name === activeSport);
  }

  // Global day order + per-day totals (computed before paging so the "Day NN"
  // index and event counts stay accurate even when a day spans pages).
  const dayOrder = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  for (const r of rows) {
    const k = dayKey(r.start_at);
    if (!dayOrder.has(k)) dayOrder.set(k, dayOrder.size + 1);
    dayCounts.set(k, (dayCounts.get(k) ?? 0) + 1);
  }

  // Page the flat (filtered) list, then group just this page's rows by day.
  const total = rows.length;
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);
  const pageRows = rows.slice(from, to + 1);

  const days = new Map<string, Row[]>();
  for (const r of pageRows) {
    const k = dayKey(r.start_at);
    if (!days.has(k)) days.set(k, []);
    days.get(k)!.push(r);
  }

  return (
    <>
      <PageHeader
        index="02"
        eyebrow="Fixtures · Venues · Times"
        title={
          <>
            The
            <br />
            <span className="text-gold">Schedule</span>
          </>
        }
        intro="Fourteen days of competition across every venue. Filter by sport to track your discipline."
      />

      <section className="container py-14 md:py-20">
        <ScheduleFilter sports={sports} active={activeSport} />

        {total === 0 ? (
          <div className="mt-10 border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No events scheduled{activeSport ? ` for ${activeSport}` : ""} yet.
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {Array.from(days.entries()).map(([day, items]) => {
              const dayNo = dayOrder.get(day) ?? 0;
              const dayTotal = dayCounts.get(day) ?? items.length;
              return (
              <div key={day}>
                {/* Day masthead */}
                <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
                  <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
                    {day}
                  </h2>
                  <span className="font-mono-data text-[11px] uppercase tracking-[0.25em] text-ink/50">
                    Day {String(dayNo).padStart(2, "0")} · {dayTotal} event
                    {dayTotal === 1 ? "" : "s"}
                  </span>
                </header>

                <ul className="divide-y divide-ink/12">
                  {items.map((r) => (
                    <li
                      key={r.id}
                      className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-5 transition-colors hover:bg-ink/[0.03]"
                    >
                      <time className="col-span-3 font-mono-data text-sm font-medium tabular-nums tracking-wide text-ink md:col-span-2">
                        {formatTime(r.start_at)}
                      </time>

                      <div className="col-span-9 md:col-span-6">
                        <div className="font-display text-xl font-bold uppercase leading-tight tracking-wide">
                          {r.events?.name}
                        </div>
                        <div className="mt-0.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/55">
                          {r.events?.sports?.name}
                          {r.events?.categories?.name
                            ? ` · ${r.events.categories.name}`
                            : ""}
                        </div>
                      </div>

                      <div className="col-span-8 font-editorial text-sm italic text-ink/70 md:col-span-2">
                        {r.venue}
                      </div>

                      <div className="col-span-4 justify-self-end md:col-span-2">
                        <StatusPill status={r.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath="/schedule"
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
