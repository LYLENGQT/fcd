import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, AdminTable, Th, Td, Tr } from "@/components/admin/admin-ui";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { formatDateTime, parsePage, pageRange } from "@/lib/utils";

export const metadata = { title: "Audit Log" };

type AuditRow = {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  profiles: { email: string } | null;
};

const ACTION_TONE: Record<string, string> = {
  insert: "text-jade",
  update: "text-gold-deep",
  delete: "text-crimson",
};

const ACTION_LABEL: Record<string, string> = {
  insert: "Created",
  update: "Edited",
  delete: "Removed",
};

/** Human-readable label for an audited record, falling back to a short UUID. */
function recordLabel(r: AuditRow): string {
  const d = r.details;
  if (d) {
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const name = str(d.name);
    if (name) return name;
    const first = str(d.first_name);
    const last = str(d.last_name);
    if (first || last) return [first, last].filter(Boolean).join(" ");
    const title = str(d.title);
    if (title) return title;
  }
  return r.entity_id ? r.entity_id.slice(0, 8) : "—";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("audit_log")
    .select(
      "id, action, entity, entity_id, details, created_at, profiles(email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as unknown as AuditRow[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        watermark="Audit"
        eyebrow="Control Desk · Accountability"
        title={
          <>
            Audit
            <br />
            <span className="text-gold">Log</span>
          </>
        }
        intro="Every create, update, and delete on results, schedule, delegations, athletes, venues, and announcements — who did what, when."
      />

      <AdminSection>
        {total === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No activity recorded yet.
          </div>
        ) : (
          <AdminTable
            head={
              <>
                <Th>When</Th>
                <Th>Who</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Record</Th>
              </>
            }
            minWidth={760}
          >
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td className="font-mono-data text-xs text-ink/60">
                  {formatDateTime(r.created_at)}
                </Td>
                <Td className="font-mono-data text-xs text-ink/70">
                  {r.profiles?.email ?? "—"}
                </Td>
                <Td>
                  <span
                    className={`font-mono-data text-[11px] font-bold uppercase tracking-[0.18em] ${
                      ACTION_TONE[r.action] ?? "text-ink/70"
                    }`}
                  >
                    {ACTION_LABEL[r.action] ?? r.action}
                  </span>
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/70">
                  {r.entity}
                </Td>
                <Td className="font-mono-data text-[11px] text-ink/60">
                  {recordLabel(r)}
                </Td>
              </Tr>
            ))}
          </AdminTable>
        )}
        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_ADMIN}
          basePath="/admin/audit"
          searchParams={searchParams}
        />
      </AdminSection>
    </>
  );
}
