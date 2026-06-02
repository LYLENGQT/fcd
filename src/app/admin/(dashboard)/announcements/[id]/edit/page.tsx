import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Announcement } from "@/lib/database.types";
import { updateAnnouncement } from "../../actions";
import { AnnouncementFields } from "../../announcement-fields";

export const metadata = { title: "Edit Announcement" };

export default async function EditAnnouncementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const announcement = data as Announcement;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/announcements", label: "All Notices" }}
        eyebrow="Official Word · Edit Notice"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">Notice</span>
          </>
        }
      />
      <AdminSection className="max-w-2xl">
        <FormCard title="Announcement">
          <EntityForm
            action={updateAnnouncement.bind(null, announcement.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/announcements"
          >
            <AnnouncementFields announcement={announcement} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
