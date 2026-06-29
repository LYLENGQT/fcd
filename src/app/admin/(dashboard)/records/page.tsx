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
import type { MeetRecord } from "@/lib/database.types";
import { createRecord, deleteRecord } from "./actions";
import { RecordFields } from "./record-fields";

export const metadata = { title: "Hall of Records" };

export default async function RecordsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("records")
    .select("*", { count: "exact" })
    .order("sport")
    .order("sort_order")
    .order("event_name")
    .range(from, to);
  const records = (data ?? []) as MeetRecord[];

  return (
    <>
      <PageHeader
        watermark="Records"
        eyebrow="Setup · Hall of Records"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Records</span>
          </>
        }
        intro="Notable meet records — the marks every delegation chases. Shown publicly in the Hall of Records."
        aside={
          <Link
            href="/records"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.25em] text-on-inv/60 transition-colors hover:text-gold"
          >
            View public ↗
          </Link>
        }
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <FormCard title="Add record">
            <EntityForm action={createRecord} submitLabel="Add record">
              <RecordFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-7">
          {records.length > 0 ? (
            <AdminTable
              head={
                <>
                  <Th>Sport / Event</Th>
                  <Th>Holder</Th>
                  <Th>Mark</Th>
                  <Th>Yr</Th>
                  <Th align="right">Actions</Th>
                </>
              }
              minWidth={720}
            >
              {records.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-display text-sm font-bold uppercase tracking-wide">
                    {r.sport}
                    <span className="block font-mono-data text-[10px] font-normal normal-case tracking-normal text-ink/55">
                      {r.event_name}
                      {r.level ? ` · ${r.level}` : ""}
                    </span>
                  </Td>
                  <Td className="font-editorial text-sm">
                    {r.record_holder}
                    {r.delegation ? (
                      <span className="block font-mono-data text-[10px] text-ink/50">
                        {r.delegation}
                      </span>
                    ) : null}
                  </Td>
                  <Td className="font-mono-data text-xs text-gold-deep">
                    {r.mark || "—"}
                  </Td>
                  <Td className="font-mono-data text-xs">{r.year_set ?? "—"}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/records/${r.id}/edit`}
                        className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deleteRecord.bind(null, r.id)} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          ) : (
            <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
              No records yet.
            </div>
          )}
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/records"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
