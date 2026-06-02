import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Schedule } from "@/lib/database.types";
import { updateSchedule } from "../../actions";
import { ScheduleFields } from "../../schedule-fields";

export const metadata = { title: "Edit Schedule Entry" };

type EventOpt = {
  id: string;
  name: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
};

export default async function EditSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: eventsData }] = await Promise.all([
    supabase.from("schedules").select("*").eq("id", params.id).single(),
    supabase
      .from("events")
      .select("id, name, sports(name), categories(name)")
      .order("created_at"),
  ]);
  if (!data) notFound();
  const schedule = data as Schedule;
  const events = (eventsData ?? []) as unknown as EventOpt[];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/schedule", label: "Full Schedule" }}
        eyebrow="Setup · Edit Entry"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">Schedule</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Schedule entry">
          <EntityForm
            action={updateSchedule.bind(null, schedule.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/schedule"
          >
            <ScheduleFields events={events} schedule={schedule} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
