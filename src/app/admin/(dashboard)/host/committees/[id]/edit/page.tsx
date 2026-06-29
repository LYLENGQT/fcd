import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Committee } from "@/lib/database.types";
import { updateCommittee } from "../../../actions";
import { CommitteeFields } from "../../../host-fields";

export const metadata = { title: "Edit Committee" };

export default async function EditCommitteePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("committees")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const committee = data as Committee;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/host", label: "Host Info" }}
        eyebrow="Setup · Edit Committee"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{committee.role_name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Committee details">
          <EntityForm
            action={updateCommittee.bind(null, committee.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/host"
          >
            <CommitteeFields committee={committee} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
