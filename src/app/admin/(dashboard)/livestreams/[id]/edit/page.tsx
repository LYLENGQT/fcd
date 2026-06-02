import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Livestream } from "@/lib/database.types";
import { updateLivestream } from "../../actions";
import { LivestreamFields } from "../../livestream-fields";

export const metadata = { title: "Edit Livestream" };

export default async function EditLivestreamPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("livestreams")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const stream = data as Livestream;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/livestreams", label: "All Feeds" }}
        eyebrow="Broadcast · Edit Feed"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">Feed</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Stream details">
          <EntityForm
            action={updateLivestream.bind(null, stream.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/livestreams"
          >
            <LivestreamFields stream={stream} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
