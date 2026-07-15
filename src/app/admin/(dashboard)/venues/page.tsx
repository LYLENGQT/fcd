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
import type { Venue } from "@/lib/database.types";
import { createVenue, deleteVenue } from "./actions";
import { VenueFields } from "./venue-fields";

export const metadata = { title: "Venues" };

export default async function VenuesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let query = supabase
    .from("venues")
    .select("*", { count: "exact" })
    .order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, count } = await query.range(from, to);
  const venues = (data ?? []) as Venue[];
  const total = count ?? 0;

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
        aside={
          <Link
            href="/venues"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-on-inv/60 transition-colors hover:text-gold"
          >
            View public ↗
          </Link>
        }
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
          <AdminSearch
            basePath="/admin/venues"
            initialQuery={q}
            placeholder="Search venues…"
          />
          <p className="mb-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
            {q
              ? `${total} match${total === 1 ? "" : "es"} for “${q}”`
              : `${total} venue${total === 1 ? "" : "s"}`}
          </p>
          {venues.length === 0 ? (
            <EmptyState>
              {q ? `No venues match “${q}”.` : "No venues yet — add one."}
            </EmptyState>
          ) : (
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
                    <DeleteButton action={deleteVenue.bind(null, v.id)} itemName={v.name} />
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
            basePath="/admin/venues"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}

