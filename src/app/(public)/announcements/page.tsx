import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_PUBLIC } from "@/lib/constants";
import { formatDateTime, parsePage, pageRange } from "@/lib/utils";
import type { Announcement } from "@/lib/database.types";

export const metadata = {
  title: "Announcements",
  description: "Official meet announcements and updates.",
};

export const revalidate = 60;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_PUBLIC);
  // RLS already hides unpublished rows from anon users.
  const { data, count } = await supabase
    .from("announcements")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);

  const announcements = (data ?? []) as Announcement[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        index="05"
        eyebrow="Official Word · Organizing Committee"
        title={
          <>
            The
            <br />
            <span className="text-gold">Bulletin</span>
          </>
        }
        intro="Rulings, schedule changes, and ceremony notices — issued straight from the committee desk."
      />

      <section className="container max-w-3xl py-14 md:py-20">
        {announcements.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No bulletins issued yet — check back at first whistle.
          </div>
        ) : (
          <div className="divide-y divide-ink/15 border-y-2 border-ink">
            {announcements.map((a, i) => (
              <article key={a.id} className="py-8">
                <div className="flex flex-wrap items-center gap-3 font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/55">
                  <span>No. {String(i + 1).padStart(3, "0")}</span>
                  <span className="h-px w-6 bg-ink/30" />
                  <time>{formatDateTime(a.published_at)}</time>
                  {a.pinned && (
                    <span className="border border-crimson bg-crimson/10 px-1.5 py-0.5 text-crimson">
                      Pinned
                    </span>
                  )}
                </div>
                <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight md:text-4xl">
                  {a.title}
                </h2>
                <p className="mt-4 whitespace-pre-wrap font-editorial text-lg leading-relaxed text-ink/80">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalCount={total}
          pageSize={PAGE_SIZE_PUBLIC}
          basePath="/announcements"
          searchParams={searchParams}
        />
      </section>
    </>
  );
}
