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
import type { Venue } from "@/lib/database.types";
import { createVenue, deleteVenue } from "./actions";
import { VenueFields } from "./venue-fields";

export const metadata = { title: "Venues" };

export default async function VenuesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("venues")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);
  const venues = (data ?? []) as Venue[];

  return (
    <>
      <PageHeader
        watermark="Venues"
        eyebrow="Setup · Competition Sites"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Venues</span>
          </>
        }
        intro="The competition sites spectators navigate to. Listed publicly with map links."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add venue">
            <EntityForm action={createVenue} submitLabel="Add venue">
              <VenueFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminTable
            head={
              <>
                <Th>Venue</Th>
                <Th>Address</Th>
                <Th>Map</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth={680}
          >
            {venues.map((v) => (
              <Tr key={v.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {v.name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">
                  {v.address ?? "—"}
                </Td>
                <Td className="font-mono-data text-xs">
                  {v.map_url ? (
                    <a
                      href={v.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-deep underline-offset-4 hover:underline"
                    >
                      Map ↗
                    </a>
                  ) : (
                    <span className="text-ink/40">—</span>
                  )}
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/venues/${v.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteVenue.bind(null, v.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/venues"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}

