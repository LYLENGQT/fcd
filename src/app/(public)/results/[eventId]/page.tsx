import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MedalTag } from "@/components/medals";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import type { MedalKind } from "@/lib/database.types";

export const revalidate = 30;

type EventDetail = {
  id: string;
  name: string;
  type: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
};

async function getEvent(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, type, sports(name), categories(name)")
    .eq("id", id)
    .single();
  return data as unknown as EventDetail | null;
}

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const e = await getEvent(params.eventId);
  return { title: e ? `${e.sports?.name} — ${e.name}` : "Result" };
}

type ResultRow = {
  id: string;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  delegations: { name: string; abbrev: string; slug: string; color: string } | null;
  athletes: { id: string; first_name: string; last_name: string } | null;
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
};

export default async function ResultDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEvent(params.eventId);
  if (!event) notFound();

  const supabase = createClient();
  const { data } = await supabase
    .from("results")
    .select(
      "id, placement, medal, mark, delegations(name, abbrev, slug, color), athletes(id, first_name, last_name)"
    )
    .eq("event_id", params.eventId)
    .order("placement", { ascending: true });

  const results = (data ?? []) as unknown as ResultRow[];

  return (
    <>
      <RealtimeRefresher table="results" />
      <PageHeader
        back={{ href: "/results", label: "All Results" }}
        eyebrow={`${event.categories?.name ?? ""} · ${event.type}`}
        title={
          <>
            {event.sports?.name}
            <br />
            <span className="text-gold">{event.name}</span>
          </>
        }
      />

      <section className="container py-14 md:py-20">
        {results.length === 0 ? (
          <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
            No podium recorded for this event yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink/12 border-y-2 border-ink">
            {results.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-12 items-center gap-x-4 gap-y-1 py-5"
              >
                <div className="col-span-2 font-display text-3xl font-black leading-none md:col-span-1">
                  {ordinal(r.placement)}
                </div>
                <div className="col-span-10 md:col-span-5">
                  {r.delegations ? (
                    <Link
                      href={`/delegations/${r.delegations.slug}`}
                      className="flex items-center gap-2 transition-colors hover:text-gold-deep"
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-sm ring-2 ring-ink/15"
                        style={{ backgroundColor: r.delegations.color }}
                        aria-hidden
                      />
                      <span className="font-display text-xl font-bold uppercase tracking-wide">
                        {r.delegations.name}
                      </span>
                    </Link>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="col-span-6 font-editorial text-base text-ink/70 md:col-span-3">
                  {r.athletes ? (
                    <Link
                      href={`/athletes/${r.athletes.id}`}
                      className="hover:text-gold-deep hover:underline"
                    >
                      {r.athletes.first_name} {r.athletes.last_name}
                    </Link>
                  ) : (
                    "Team"
                  )}
                </div>
                <div className="col-span-3 font-mono-data text-sm tabular-nums text-ink/60 md:col-span-2">
                  {r.mark ?? "—"}
                </div>
                <div className="col-span-3 justify-self-end md:col-span-1">
                  <MedalTag medal={r.medal} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
