import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { EmergencyContact } from "@/lib/database.types";
import { updateEmergencyContact } from "../../../actions";
import { EmergencyContactFields } from "../../../host-fields";

export const metadata = { title: "Edit Emergency Contact" };

export default async function EditEmergencyContactPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const contact = data as EmergencyContact;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/host", label: "Host Info" }}
        eyebrow="Setup · Edit Emergency Contact"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{contact.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Contact details">
          <EntityForm
            action={updateEmergencyContact.bind(null, contact.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/host"
          >
            <EmergencyContactFields contact={contact} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
