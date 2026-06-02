import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Athlete, Delegation } from "@/lib/database.types";
import { updateAthlete } from "../../actions";
import { AthleteFields } from "../../athlete-fields";

export const metadata = { title: "Edit Athlete" };

export default async function EditAthletePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: delegationsData }] = await Promise.all([
    supabase.from("athletes").select("*").eq("id", params.id).single(),
    supabase.from("delegations").select("*").order("name"),
  ]);
  if (!data) notFound();
  const athlete = data as Athlete;
  const delegations = (delegationsData ?? []) as Delegation[];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/athletes", label: "All Athletes" }}
        eyebrow="Setup · Edit Competitor"
        title={
          <>
            {athlete.first_name}
            <br />
            <span className="text-gold">{athlete.last_name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Athlete details">
          <EntityForm
            action={updateAthlete.bind(null, athlete.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/athletes"
          >
            <AthleteFields delegations={delegations} athlete={athlete} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
