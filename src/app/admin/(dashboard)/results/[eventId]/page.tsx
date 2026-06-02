import Link from "next/link";
import { notFound } from "next/navigation";
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
import { DeleteButton } from "@/components/admin/delete-button";
import { MedalTag } from "@/components/medals";
import type { Athlete, Delegation, MedalKind } from "@/lib/database.types";
import { deleteResult } from "../actions";
import { EncodeForm, type EditingResult } from "./encode-form";

export const metadata = { title: "Encode Event" };

type EventDetail = {
  id: string;
  name: string;
  type: "individual" | "team";
  sports: { name: string } | null;
  categories: { name: string } | null;
};

type ResultRow = {
  id: string;
  delegation_id: string;
  athlete_id: string | null;
  placement: number;
  medal: MedalKind;
  mark: string | null;
  delegations: { name: string; abbrev: string } | null;
  athletes: { first_name: string; last_name: string } | null;
};

export default async function EncodeEventPage({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams: { edit?: string };
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, type, sports(name), categories(name)")
    .eq("id", params.eventId)
    .single();

  if (!event) notFound();
  const ev = event as unknown as EventDetail;

  const [{ data: resultsData }, { data: delegationsData }, { data: athletesData }] =
    await Promise.all([
      supabase
        .from("results")
        .select(
          "id, delegation_id, athlete_id, placement, medal, mark, delegations(name, abbrev), athletes(first_name, last_name)"
        )
        .eq("event_id", params.eventId)
        .order("placement", { ascending: true }),
      supabase.from("delegations").select("*").order("name"),
      supabase
        .from("athletes")
        .select("id, first_name, last_name, delegation_id")
        .order("last_name"),
    ]);

  const results = (resultsData ?? []) as unknown as ResultRow[];
  const delegations = (delegationsData ?? []) as Delegation[];
  const athletes = (athletesData ?? []) as Pick<
    Athlete,
    "id" | "first_name" | "last_name" | "delegation_id"
  >[];

  const editingRow = searchParams.edit
    ? results.find((r) => r.id === searchParams.edit)
    : undefined;
  const editing: EditingResult | undefined = editingRow
    ? {
        id: editingRow.id,
        delegation_id: editingRow.delegation_id,
        athlete_id: editingRow.athlete_id,
        placement: editingRow.placement,
        medal: editingRow.medal,
        mark: editingRow.mark,
      }
    : undefined;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/results", label: "All Events" }}
        eyebrow={`Encoding · ${ev.categories?.name ?? ""} · ${ev.type}`}
        title={
          <>
            {ev.sports?.name}
            <br />
            <span className="text-gold">{ev.name}</span>
          </>
        }
        intro="Encode podium finishes. Medals default from placement (1=Gold, 2=Silver, 3=Bronze) and the tally updates instantly."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <FormCard title={editing ? "Edit result" : "Add result"}>
            <EncodeForm
              eventId={ev.id}
              isTeamEvent={ev.type === "team"}
              delegations={delegations}
              athletes={athletes}
              editing={editing}
            />
          </FormCard>
        </div>

        <div className="lg:col-span-7">
          {results.length === 0 ? (
            <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
              No results yet for this event.
            </div>
          ) : (
            <AdminTable
              head={
                <>
                  <Th>#</Th>
                  <Th>Delegation</Th>
                  <Th>Athlete</Th>
                  <Th>Medal</Th>
                  <Th>Mark</Th>
                  <Th align="right">Actions</Th>
                </>
              }
              minWidth={680}
            >
              {results.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-display text-xl font-black">{r.placement}</Td>
                  <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/70">
                    {r.delegations?.abbrev}
                  </Td>
                  <Td className="font-mono-data text-xs text-ink/60">
                    {r.athletes
                      ? `${r.athletes.first_name} ${r.athletes.last_name}`
                      : "Team"}
                  </Td>
                  <Td>
                    <MedalTag medal={r.medal} />
                  </Td>
                  <Td className="font-mono-data text-xs text-ink/60">
                    {r.mark ?? "—"}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/results/${ev.id}?edit=${r.id}`}
                        scroll={false}
                        className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deleteResult.bind(null, r.id, ev.id)} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          )}
        </div>
      </AdminSection>
    </>
  );
}
