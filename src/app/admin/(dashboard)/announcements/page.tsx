import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard, ListHeading } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { formatDateTime, parsePage, pageRange } from "@/lib/utils";
import type { Announcement } from "@/lib/database.types";
import { createAnnouncement, deleteAnnouncement } from "./actions";
import { AnnouncementFields } from "./announcement-fields";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let query = supabase.from("announcements").select("*", { count: "exact" });
  if (q) query = query.ilike("title", `%${q}%`);
  const { data, count } = await query
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);
  const announcements = (data ?? []) as Announcement[];

  return (
    <>
      <PageHeader
        watermark="Announcements"
        eyebrow="Official Word · Committee Desk"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Bulletin</span>
          </>
        }
        intro="Issue rulings, schedule changes, and ceremony notices. Drafts stay hidden until published."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="New announcement">
            <EntityForm action={createAnnouncement} submitLabel="Publish">
              <AnnouncementFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminSearch
            basePath="/admin/announcements"
            placeholder="Search announcements by title…"
            initialQuery={q}
          />
          <ListHeading
            title="All Notices"
            count={count ?? 0}
            countNoun="notices"
          />
          <div className="mt-4 divide-y divide-ink/12 border-y border-ink/15">
            {announcements.length === 0 && (
              <p className="py-10 text-center font-editorial text-xl italic text-ink/45">
                No announcements yet.
              </p>
            )}
            {announcements.map((a, i) => (
              <article key={a.id} className="flex items-start justify-between gap-4 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.22em] text-ink/55">
                    <span>No. {String(i + 1).padStart(3, "0")}</span>
                    <span className="h-px w-5 bg-ink/30" />
                    <time>{formatDateTime(a.published_at)}</time>
                    {a.pinned && (
                      <span className="border border-crimson bg-crimson/10 px-1.5 py-0.5 text-crimson">
                        Pinned
                      </span>
                    )}
                    {!a.published && (
                      <span className="border border-ink/30 px-1.5 py-0.5 text-ink/50">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-bold uppercase leading-tight tracking-wide">
                    {a.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 font-editorial text-base text-ink/70">
                    {a.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/admin/announcements/${a.id}/edit`}
                    className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton action={deleteAnnouncement.bind(null, a.id)} itemName={a.title} />
                </div>
              </article>
            ))}
          </div>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/announcements"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
