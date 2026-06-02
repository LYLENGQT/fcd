import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  AdminSection,
  AdminTable,
  Th,
  Td,
  Tr,
} from "@/components/admin/admin-ui";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";

export const metadata = { title: "Results / Encoding" };

type EventListRow = {
  id: string;
  name: string;
  type: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
  results: { count: number }[];
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("events")
    .select("id, name, type, sports(name), categories(name), results(count)", {
      count: "exact",
    })
    .order("created_at", { ascending: true })
    .range(from, to);

  const events = (data ?? []) as unknown as EventListRow[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        watermark="Results"
        eyebrow="Encoding · Live Results"
        title={
          <>
            Encode
            <br />
            <span className="text-gold">Results</span>
          </>
        }
        intro="Pick an event to encode podium results. Medals and the medal tally derive automatically."
      />

      <AdminSection>
        {total === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No events yet. Create events under Setup → Events (or run the seed).
          </div>
        ) : (
          <AdminTable
            head={
              <>
                <Th>Event</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th align="center">Encoded</Th>
                <Th align="right">Action</Th>
              </>
            }
            minWidth={720}
          >
            {events.map((e) => {
              const count = e.results?.[0]?.count ?? 0;
              return (
                <Tr key={e.id}>
                  <Td className="font-display text-lg font-bold uppercase tracking-wide">
                    {e.sports?.name} — {e.name}
                  </Td>
                  <Td className="font-mono-data text-xs text-ink/60">
                    {e.categories?.name}
                  </Td>
                  <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                    {e.type}
                  </Td>
                  <Td align="center">
                    <span
                      className={
                        count > 0
                          ? "font-mono-data text-sm font-medium tabular-nums text-ink"
                          : "font-mono-data text-sm tabular-nums text-ink/35"
                      }
                    >
                      {count}
                    </span>
                  </Td>
                  <Td align="right">
                    <Link
                      href={`/admin/results/${e.id}`}
                      className="inline-flex items-center gap-1.5 border border-ink/25 px-3 py-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink transition hover:border-gold-deep hover:text-gold-deep"
                    >
                      Encode
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </AdminTable>
        )}
        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_ADMIN}
          basePath="/admin/results"
          searchParams={searchParams}
        />
      </AdminSection>
    </>
  );
}
