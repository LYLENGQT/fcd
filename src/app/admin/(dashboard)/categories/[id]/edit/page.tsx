import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import type { Category } from "@/lib/database.types";
import { updateCategory } from "../../actions";
import { CategoryFields } from "../../category-fields";

export const metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const category = data as Category;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/categories", label: "All Categories" }}
        eyebrow="Setup · Edit Division"
        title={
          <>
            Edit
            <br />
            <span className="text-gold">{category.name}</span>
          </>
        }
      />
      <AdminSection className="max-w-xl">
        <FormCard title="Category details">
          <EntityForm
            action={updateCategory.bind(null, category.id)}
            submitLabel="Save changes"
            resetOnSuccess={false}
            redirectTo="/admin/categories"
          >
            <CategoryFields category={category} />
          </EntityForm>
        </FormCard>
      </AdminSection>
    </>
  );
}
