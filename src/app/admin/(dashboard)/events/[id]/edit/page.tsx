import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Category, EventRow, Sport } from "@/lib/database.types";
import { updateEvent } from "../../actions";
import { EventFields } from "../../event-fields";

export const metadata = { title: "Edit Event" };

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: sportsData }, { data: catsData }] = await Promise.all([
    supabase.from("events").select("*").eq("id", params.id).single(),
    supabase.from("sports").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);
  if (!data) notFound();
  const event = data as EventRow;
  const sports = (sportsData ?? []) as Sport[];
  const categories = (catsData ?? []) as Category[];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/events", label: "All Events" }}
        eyebrow="Setup · Edit Event"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{event.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Event details">
          <EntityForm
            action={updateEvent.bind(null, event.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/events"
          >
            <EventFields sports={sports} categories={categories} event={event} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
