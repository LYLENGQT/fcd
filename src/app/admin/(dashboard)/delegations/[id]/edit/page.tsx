import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Delegation } from "@/lib/database.types";
import { updateDelegation } from "../../actions";
import { DelegationFields } from "../../delegation-fields";

export const metadata = { title: "Edit Delegation" };

export default async function EditDelegationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("delegations")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const delegation = data as Delegation;

  return (
    <>
      <PageHeader
        accent={delegation.color}
        back={{ href: "/admin/delegations", label: "All Delegations" }}
        eyebrow="Setup · Edit Delegation"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{delegation.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Delegation details">
          <EntityForm
            action={updateDelegation.bind(null, delegation.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/delegations"
          >
            <DelegationFields delegation={delegation} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
