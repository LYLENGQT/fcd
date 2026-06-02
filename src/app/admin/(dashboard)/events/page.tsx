import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  AdminSection,
  FormCard,
  AdminTable,
  Th,
  Td,
  Tr,
} from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Category, Sport } from "@/lib/database.types";
import { createEvent, deleteEvent } from "./actions";
import { EventFields } from "./event-fields";

export const metadata = { title: "Events" };

type EventListRow = {
  id: string;
  name: string;
  type: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
  results: { count: number }[];
};

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let eventsQuery = supabase
    .from("events")
    .select(
      "id, name, type, sports(name), categories(name), results(count)",
      { count: "exact" },
    );
  if (q) eventsQuery = eventsQuery.ilike("name", `%${q}%`);

  const [
    { data: eventsData, count },
    { data: sportsData },
    { data: catsData },
  ] = await Promise.all([
    eventsQuery.order("created_at").range(from, to),
    supabase.from("sports").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  const events = (eventsData ?? []) as unknown as EventListRow[];
  const sports = (sportsData ?? []) as Sport[];
  const categories = (catsData ?? []) as Category[];

  return (
    <>
      <PageHeader
        watermark="Events"
        eyebrow="Setup · Programme"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Events</span>
          </>
        }
        intro="The contested events. Each belongs to a sport and a category, and is where results are encoded."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add event">
            {sports.length === 0 || categories.length === 0 ? (
              <p className="font-editorial text-lg italic text-ink/55">
                Add at least one sport and one category first.
              </p>
            ) : (
              <EntityForm action={createEvent} submitLabel="Add event">
                <EventFields sports={sports} categories={categories} />
              </EntityForm>
            )}
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminSearch
            basePath="/admin/events"
            placeholder="Search events by name…"
            initialQuery={q}
          />
          <AdminTable
            head={
              <>
                <Th>Event</Th>
                <Th>Sport</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th align="center">Results</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth={760}
          >
            {events.map((e) => (
              <Tr key={e.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {e.name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">
                  {e.sports?.name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">
                  {e.categories?.name}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {e.type}
                </Td>
                <Td align="center" className="font-mono-data tabular-nums">
                  {e.results?.[0]?.count ?? 0}
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteEvent.bind(null, e.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/events"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
