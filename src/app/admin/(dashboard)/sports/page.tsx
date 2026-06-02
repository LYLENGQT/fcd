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
import type { Sport } from "@/lib/database.types";
import { createSport, deleteSport } from "./actions";
import { SportFields } from "./sport-fields";

export const metadata = { title: "Sports" };

type SportRow = Sport & { events: { count: number }[] };

export default async function SportsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("sports")
    .select("*, events(count)", { count: "exact" })
    .order("name")
    .range(from, to);
  const sports = (data ?? []) as unknown as SportRow[];

  return (
    <>
      <PageHeader
        watermark="Sports"
        eyebrow="Setup · Disciplines"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Sports</span>
          </>
        }
        intro="The disciplines contested at the meet. Each event belongs to one sport."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add sport">
            <EntityForm action={createSport} submitLabel="Add sport">
              <SportFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminTable
            head={
              <>
                <Th>Sport</Th>
                <Th>Slug</Th>
                <Th align="center">Events</Th>
                <Th align="right">Actions</Th>
              </>
            }
          >
            {sports.map((s) => (
              <Tr key={s.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {s.name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">{s.slug}</Td>
                <Td align="center" className="font-mono-data tabular-nums">
                  {s.events?.[0]?.count ?? 0}
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/sports/${s.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteSport.bind(null, s.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/sports"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
