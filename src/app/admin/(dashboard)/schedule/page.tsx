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
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { formatDateTime, parsePage, pageRange } from "@/lib/utils";
import type { ScheduleStatus } from "@/lib/database.types";
import { createSchedule, deleteSchedule } from "./actions";
import { ScheduleFields } from "./schedule-fields";
import { StatusSelect } from "./status-select";

export const metadata = { title: "Schedule" };

type EventOpt = {
  id: string;
  name: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
};
type ScheduleRow = {
  id: string;
  venue: string;
  start_at: string;
  status: ScheduleStatus;
  events: { name: string; sports: { name: string } | null } | null;
};

export default async function ScheduleAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const [{ data: schedulesData, count }, { data: eventsData }] =
    await Promise.all([
      supabase
        .from("schedules")
        .select("id, venue, start_at, status, events(name, sports(name))", {
          count: "exact",
        })
        .order("start_at")
        .range(from, to),
      supabase
        .from("events")
        .select("id, name, sports(name), categories(name)")
        .order("created_at"),
    ]);

  const schedules = (schedulesData ?? []) as unknown as ScheduleRow[];
  const events = (eventsData ?? []) as unknown as EventOpt[];

  return (
    <>
      <PageHeader
        watermark="Schedule"
        eyebrow="Setup · Programme & Venues"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Schedule</span>
          </>
        }
        intro="Place each event on the calendar with a venue and start time. Flip status live as the day unfolds."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add schedule entry">
            {events.length === 0 ? (
              <p className="font-editorial text-lg italic text-ink/55">
                Add at least one event first.
              </p>
            ) : (
              <EntityForm action={createSchedule} submitLabel="Add to schedule">
                <ScheduleFields events={events} />
              </EntityForm>
            )}
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminTable
            head={
              <>
                <Th>Event</Th>
                <Th>Venue</Th>
                <Th>Start</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth={760}
          >
            {schedules.map((s) => (
              <Tr key={s.id}>
                <Td className="font-display text-base font-bold uppercase tracking-wide">
                  {s.events?.sports?.name} — {s.events?.name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">{s.venue}</Td>
                <Td className="font-mono-data text-xs text-ink/60">
                  {formatDateTime(s.start_at)}
                </Td>
                <Td>
                  <StatusSelect id={s.id} current={s.status} />
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/schedule/${s.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteSchedule.bind(null, s.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/schedule"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
