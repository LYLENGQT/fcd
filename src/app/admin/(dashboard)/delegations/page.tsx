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
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Delegation } from "@/lib/database.types";
import { createDelegation, deleteDelegation } from "./actions";
import { DelegationFields } from "./delegation-fields";

export const metadata = { title: "Delegations" };

export default async function DelegationsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let query = supabase.from("delegations").select("*", { count: "exact" });
  if (q) query = query.or(`name.ilike.%${q}%,abbrev.ilike.%${q}%`);
  const { data, count } = await query.order("name").range(from, to);
  const delegations = (data ?? []) as Delegation[];

  return (
    <>
      <PageHeader
        watermark="Delegations"
        eyebrow="Setup · Competing Towns"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Delegations</span>
          </>
        }
        intro="The competing delegations. Their color drives the tally swatches and accents across the site."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add delegation">
            <EntityForm action={createDelegation} submitLabel="Add delegation">
              <DelegationFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminSearch
            basePath="/admin/delegations"
            placeholder="Search delegations…"
            initialQuery={q}
          />
          <AdminTable
            head={
              <>
                <Th>Delegation</Th>
                <Th>Abbrev</Th>
                <Th align="center">Color</Th>
                <Th align="right">Actions</Th>
              </>
            }
          >
            {delegations.map((d) => (
              <Tr key={d.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {d.name}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {d.abbrev}
                </Td>
                <Td align="center">
                  <span
                    className="inline-block h-4 w-4 rounded-sm ring-2 ring-ink/15 align-middle"
                    style={{ backgroundColor: d.color }}
                  />
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/delegations/${d.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteDelegation.bind(null, d.id)}
                      confirmText={`Delete ${d.name}? This removes its athletes and results.`}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/delegations"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
