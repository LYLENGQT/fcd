import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { FilterBar } from "@/components/filter-bar";
import { Trophy } from "lucide-react";
import type { MeetRecord } from "@/lib/database.types";

export const metadata = {
  title: "Hall of Records",
  description:
    "Standing meet records across every sport — the marks each delegation chases.",
};

export const revalidate = 300;

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: { sport?: string; division?: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("records")
    .select("*")
    .order("sport")
    .order("sort_order")
    .order("event_name");
  const allRecords = (data ?? []) as MeetRecord[];

  // Options from the full set so chips stay stable under any filter.
  const sportOptions = Array.from(
    new Set(allRecords.map((r) => r.sport).filter(Boolean)),
  ).sort();
  const divisionOptions = Array.from(
    new Set(allRecords.map((r) => r.level).filter(Boolean) as string[]),
  ).sort();

  const activeSport = searchParams.sport;
  const activeDivision = searchParams.division;
  const hasFilter = Boolean(activeSport || activeDivision);
  const records = allRecords.filter(
    (r) =>
      (!activeSport || r.sport === activeSport) &&
      (!activeDivision || r.level === activeDivision),
  );

  // Group by sport, preserving the sorted order.
  const bySport = new Map<string, MeetRecord[]>();
  for (const r of records) {
    const arr = bySport.get(r.sport) ?? [];
    arr.push(r);
    bySport.set(r.sport, arr);
  }
  const groups = Array.from(bySport.entries());

  return (
    <>
      <PageHeader
        eyebrow="Meet Archive · Best Marks"
        title={
          <>
            Hall of <span className="text-gold">Records</span>
          </>
        }
        intro="The standing records of the meet — every mark here is a target for the next champion."
      />

      <section className="container py-14 md:py-20">
        {allRecords.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Records will be published here.
          </div>
        ) : (
          <>
            <FilterBar
              basePath="/records"
              current={{ sport: activeSport, division: activeDivision }}
              groups={[
                {
                  key: "sport",
                  label: "Sport",
                  allLabel: "All Sports",
                  options: sportOptions.map((s) => ({ value: s, label: s })),
                },
                {
                  key: "division",
                  label: "Division",
                  allLabel: "All Divisions",
                  options: divisionOptions.map((d) => ({ value: d, label: d })),
                },
              ]}
            />
            <p className="mb-10 mt-6 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
              <span className="text-gold-deep">{records.length}</span> record
              {records.length === 1 ? "" : "s"}
              {hasFilter ? " shown" : ""}
            </p>
            {records.length === 0 ? (
              <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
                No records match these filters — try clearing one.
              </div>
            ) : (
              <div className="space-y-14">
                {groups.map(([sport, rows]) => (
              <div key={sport}>
                <header className="flex items-center gap-3 border-b-2 border-ink pb-3">
                  <Trophy className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
                    {sport}
                  </h2>
                </header>
                <div className="mt-4 overflow-x-auto">
                  <table
                    className="w-full border-collapse"
                    style={{ minWidth: "720px" }}
                  >
                    <thead>
                      <tr className="border-b border-ink/20 text-left font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/55">
                        <th className="py-2 pr-4 font-normal">Event</th>
                        <th className="py-2 pr-4 font-normal">Record Holder</th>
                        <th className="py-2 pr-4 font-normal">Delegation</th>
                        <th className="py-2 pr-4 font-normal">Mark</th>
                        <th className="py-2 pr-4 font-normal">Division</th>
                        <th className="py-2 font-normal">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="transition-colors hover:bg-ink/[0.04]"
                        >
                          <td className="py-3 pr-4 font-display text-sm font-bold uppercase tracking-wide">
                            {r.event_name}
                          </td>
                          <td className="py-3 pr-4 font-editorial text-base">
                            {r.record_holder}
                          </td>
                          <td className="py-3 pr-4 font-mono-data text-xs text-ink/60">
                            {r.delegation || "—"}
                          </td>
                          <td className="py-3 pr-4 font-mono-data text-sm text-gold-deep">
                            {r.mark || "—"}
                          </td>
                          <td className="py-3 pr-4 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/55">
                            {r.level || "—"}
                          </td>
                          <td className="py-3 font-mono-data text-xs">
                            {r.year_set ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
