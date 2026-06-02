import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  AdminSection,
  FormCard,
  AdminTable,
  Th,
  Td,
  Tr,
} from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Category } from "@/lib/database.types";
import { createCategory, deleteCategory } from "./actions";
import { CategoryFields } from "./category-fields";

export const metadata = { title: "Categories" };

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("level")
    .order("gender")
    .range(from, to);
  const categories = (data ?? []) as Category[];

  return (
    <>
      <PageHeader
        watermark="Categories"
        eyebrow="Setup · Divisions"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Categories</span>
          </>
        }
        intro="Age-level and gender divisions (e.g. Secondary Boys). Each event is contested in one category."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add category">
            <EntityForm action={createCategory} submitLabel="Add category">
              <CategoryFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminTable
            head={
              <>
                <Th>Category</Th>
                <Th>Level</Th>
                <Th>Division</Th>
                <Th align="right">Actions</Th>
              </>
            }
          >
            {categories.map((c) => (
              <Tr key={c.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {c.name}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {c.level}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {c.gender}
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/categories/${c.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteCategory.bind(null, c.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/categories"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
