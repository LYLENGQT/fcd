import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Venue } from "@/lib/database.types";
import { updateVenue } from "../../actions";
import { VenueFields } from "../../venue-fields";

export const metadata = { title: "Edit Venue" };

export default async function EditVenuePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const venue = data as Venue;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/venues", label: "All Venues" }}
        eyebrow="Setup · Edit Venue"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{venue.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Venue details">
          <EntityForm
            action={updateVenue.bind(null, venue.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/venues"
          >
            <VenueFields venue={venue} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
