import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, AdminTable, Th, Td, Tr } from "@/components/admin/admin-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Feedback } from "@/lib/database.types";
import { deleteFeedback } from "./actions";

export const metadata = { title: "Feedback" };

/** Short relative time, e.g. "3h ago", "2d ago", or a date for older items. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function FeedbackAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("feedback")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const items = (data ?? []) as Feedback[];

  return (
    <>
      <PageHeader
        watermark="Feedback"
        eyebrow="Inbox · Public Feedback"
        title={
          <>
            Public
            <br />
            <span className="text-gold">Feedback</span>
          </>
        }
        intro="Messages submitted through the public feedback form. Admin-only."
      />

      <AdminSection>
        <p className="mb-5 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/45">
          {count ?? 0} {(count ?? 0) === 1 ? "message" : "messages"}
          {page === 1 && items.length > 0
            ? ` · latest ${relativeTime(items[0].created_at)}`
            : null}
        </p>
        {items.length > 0 ? (
          <>
            <AdminTable
              head={
                <>
                  <Th>Received</Th>
                  <Th>From</Th>
                  <Th>Message</Th>
                  <Th align="right">Actions</Th>
                </>
              }
              minWidth={820}
            >
              {items.map((f) => (
                <Tr key={f.id}>
                  <Td className="whitespace-nowrap font-mono-data text-[11px] text-ink/55">
                    {new Date(f.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td>
                    <span className="font-display text-sm font-bold uppercase tracking-wide">
                      {f.name || "Anonymous"}
                    </span>
                    {f.email ? (
                      <a
                        href={`mailto:${f.email}?subject=Re: ${encodeURIComponent(
                          f.subject || "Your feedback"
                        )}`}
                        className="block font-mono-data text-[10px] text-ink/50 underline-offset-2 hover:text-gold-deep hover:underline"
                      >
                        {f.email}
                      </a>
                    ) : null}
                  </Td>
                  <Td className="font-editorial text-sm text-ink/80">
                    {f.subject ? (
                      <span className="block font-display text-xs font-bold uppercase tracking-wide text-ink">
                        {f.subject}
                      </span>
                    ) : null}
                    <span className="block max-w-md whitespace-pre-line">
                      {f.message}
                    </span>
                  </Td>
                  <Td align="right">
                    <DeleteButton action={deleteFeedback.bind(null, f.id)} />
                  </Td>
                </Tr>
              ))}
            </AdminTable>
            <Pagination
              page={page}
              totalCount={count ?? 0}
              pageSize={PAGE_SIZE_ADMIN}
              basePath="/admin/feedback"
              searchParams={searchParams}
            />
          </>
        ) : (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No feedback yet.
          </div>
        )}
      </AdminSection>
    </>
  );
}
