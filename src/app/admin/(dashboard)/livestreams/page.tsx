import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminSection, FormCard, ListHeading } from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Livestream } from "@/lib/database.types";
import { createLivestream, deleteLivestream } from "./actions";
import { LivestreamFields } from "./livestream-fields";

export const metadata = { title: "Livestreams" };

export default async function LivestreamsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);

  const supabase = createClient();
  const { data, count } = await supabase
    .from("livestreams")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const streams = (data ?? []) as Livestream[];

  return (
    <>
      <PageHeader
        watermark="Broadcast"
        eyebrow="Broadcast · Feeds"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Broadcast</span>
          </>
        }
        intro="Attach YouTube or Facebook feeds. Mark one live and it surfaces on the public broadcast page."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add stream">
            <EntityForm action={createLivestream} submitLabel="Add stream">
              <LivestreamFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <ListHeading
            title="All Feeds"
            count={count ?? 0}
            countNoun="feeds"
          />
          <div className="mt-4 divide-y divide-ink/12 border-y border-ink/15">
            {streams.length === 0 && (
              <p className="py-10 text-center font-editorial text-xl italic text-ink/45">
                No streams yet.
              </p>
            )}
            {streams.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 py-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                      {s.title}
                    </h3>
                    {s.is_live && (
                      <span className="inline-flex items-center gap-1 bg-crimson px-1.5 py-0.5 font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-bone">
                        <span className="h-1.5 w-1.5 rounded-full bg-bone pulse-dot" />
                        Live
                      </span>
                    )}
                    <span className="border border-ink/20 px-1.5 py-0.5 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink/55">
                      {s.platform}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono-data text-[11px] text-ink/50">
                    {s.embed_url}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/admin/livestreams/${s.id}/edit`}
                    className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton action={deleteLivestream.bind(null, s.id)} />
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/livestreams"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
