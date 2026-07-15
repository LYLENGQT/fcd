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
  EmptyState,
} from "@/components/admin/admin-ui";
import { AdminSearch } from "@/components/admin/admin-search";
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
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("level")
    .order("gender");
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, count } = await query.range(from, to);
  const categories = (data ?? []) as Category[];
  const total = count ?? 0;

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
          <AdminSearch
            basePath="/admin/categories"
            initialQuery={q}
            placeholder="Search categories…"
          />
          <p className="mb-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
            {q
              ? `${total} match${total === 1 ? "" : "es"} for “${q}”`
              : `${total} categor${total === 1 ? "y" : "ies"}`}
          </p>
          {categories.length === 0 ? (
            <EmptyState>
              {q
                ? `No categories match “${q}”.`
                : "No categories yet — add one."}
            </EmptyState>
          ) : (
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
                    <DeleteButton action={deleteCategory.bind(null, c.id)} itemName={c.name} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          )}
          <Pagination
            page={page}
            totalCount={total}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/categories"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
