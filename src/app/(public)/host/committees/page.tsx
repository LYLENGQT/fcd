import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Users } from "lucide-react";
import type { Committee } from "@/lib/database.types";

export const metadata = {
  title: "Committees",
  description: "Meet organizing committees and their members.",
};

export const revalidate = 300;

export default async function CommitteesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("committees")
    .select("*")
    .order("sort_order");

  const committees = (data ?? []) as Committee[];

  return (
    <>
      <PageHeader
        eyebrow="Host Municipality · Organizing Team"
        title={
          <>
            <span className="text-gold">Committees</span>
          </>
        }
        intro="The people making this meet happen — from logistics to ceremonies."
      />

      <section className="container py-14 md:py-20">
        {committees.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            Committee listings will be posted closer to the meet.
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden border border-ink/15">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink/15 bg-ink/[0.03]">
                    <th className="px-6 py-4 text-left font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/50">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/50">
                      Designated Person
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {committees.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-ink/[0.02]"
                    >
                      <td className="px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-ink/85">
                        {c.role_name}
                      </td>
                      <td className="px-6 py-4 font-editorial text-base text-ink/70">
                        {c.person_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
              <Users className="h-3.5 w-3.5" />
              {committees.length} committee{committees.length === 1 ? "" : "s"}
            </div>
          </div>
        )}

        {/* ── Related ─────────────────────────────────────────────────── */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/15 pt-6">
          <span className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-ink/40">
            Related
          </span>
          <Link
            href="/host/emergency"
            className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
          >
            Emergency Directory
          </Link>
          <span className="text-ink/20">·</span>
          <Link
            href="/host/accommodation"
            className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-gold"
          >
            Accommodation
          </Link>
        </div>
      </section>
    </>
  );
}
