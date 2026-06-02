import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Sport } from "@/lib/database.types";
import { updateSport } from "../../actions";
import { SportFields } from "../../sport-fields";

export const metadata = { title: "Edit Sport" };

export default async function EditSportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("sports")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const sport = data as Sport;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/sports", label: "All Sports" }}
        eyebrow="Setup · Edit Discipline"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{sport.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Sport details">
          <EntityForm
            action={updateSport.bind(null, sport.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/sports"
          >
            <SportFields sport={sport} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
