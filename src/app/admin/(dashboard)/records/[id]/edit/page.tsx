import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { MeetRecord } from "@/lib/database.types";
import { updateRecord } from "../../actions";
import { RecordFields } from "../../record-fields";

export const metadata = { title: "Edit Record" };

export default async function EditRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("records")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const record = data as MeetRecord;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/records", label: "All Records" }}
        eyebrow="Setup · Edit Record"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{record.event_name}</span>
          </>
        }
      />
      <AdminSection className="max-w-2xl">
        <FormCard title="Record details">
          <EntityForm
            action={updateRecord.bind(null, record.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/records"
          >
            <RecordFields record={record} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
