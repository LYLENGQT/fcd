import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  AdminSection,
  FormCard,
  Field,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Mascot } from "@/lib/database.types";
import { saveMascot } from "./actions";

export const metadata = { title: "Mascot" };

export default async function MascotAdminPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("mascot")
    .select("*")
    .limit(1)
    .maybeSingle();
  const mascot = data as Mascot | null;

  return (
    <>
      <PageHeader
        watermark="Mascot"
        eyebrow="Setup · The Mascot"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Mascot</span>
          </>
        }
        intro="The face of the meet. Set the mascot's name, story, and artwork."
      />

      <AdminSection className="max-w-2xl">
        <FormCard
          title="Mascot details"
          description="Shown on the public The Mascot page."
        >
          <EntityForm
            action={saveMascot}
            submitLabel="Save mascot"
            resetOnSuccess={false}
          >
            <Field label="Name" htmlFor="name">
              <AdminInput
                id="name"
                name="name"
                defaultValue={mascot?.name ?? ""}
                placeholder="e.g. “Sunny” the Rising Sun"
              />
            </Field>
            <Field label="Tagline (optional)" htmlFor="tagline">
              <AdminInput
                id="tagline"
                name="tagline"
                defaultValue={mascot?.tagline ?? ""}
                placeholder="Spirit of the District"
              />
            </Field>
            <ImageUploadField
              name="image_url"
              label="Mascot artwork"
              folder="mascot"
              defaultValue={mascot?.image_url ?? ""}
            />
            <Field label="Description" htmlFor="description">
              <AdminTextarea
                id="description"
                name="description"
                rows={5}
                defaultValue={mascot?.description ?? ""}
                placeholder="Who is the mascot? What does it represent? (Line breaks are preserved.)"
              />
            </Field>
            <Field label="Symbolism (optional)" htmlFor="symbolism">
              <AdminTextarea
                id="symbolism"
                name="symbolism"
                rows={4}
                defaultValue={mascot?.symbolism ?? ""}
                placeholder="Colors, elements, and what each stands for."
              />
            </Field>
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
