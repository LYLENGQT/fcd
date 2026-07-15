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
import { AdminSearch } from "@/components/admin/admin-search";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE_ADMIN } from "@/lib/constants";
import { parsePage, pageRange } from "@/lib/utils";
import type { Delegation } from "@/lib/database.types";
import { createAthlete, deleteAthlete } from "./actions";
import { AthleteFields } from "./athlete-fields";

export const metadata = { title: "Athletes" };

type AthleteRow = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  level: string | null;
  delegations: { name: string; abbrev: string } | null;
};

export default async function AthletesAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = parsePage(searchParams.page);
  const { from, to } = pageRange(page, PAGE_SIZE_ADMIN);
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let athletesQuery = supabase
    .from("athletes")
    .select(
      "id, first_name, last_name, gender, level, delegations(name, abbrev)",
      { count: "exact" },
    );
  if (q) {
    athletesQuery = athletesQuery.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%`,
    );
  }

  const [{ data: athletesData, count }, { data: delegationsData }] =
    await Promise.all([
      athletesQuery.order("last_name").range(from, to),
      supabase.from("delegations").select("*").order("name"),
    ]);

  const athletes = (athletesData ?? []) as unknown as AthleteRow[];
  const delegations = (delegationsData ?? []) as Delegation[];

  return (
    <>
      <PageHeader
        watermark="Athletes"
        eyebrow="Setup · Competitors"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Athletes</span>
          </>
        }
        intro="The registered competitors. Each belongs to a delegation and can be attributed results."
      />

      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FormCard title="Add athlete">
            {delegations.length === 0 ? (
              <p className="font-editorial text-lg italic text-ink/55">
                Add at least one delegation first.
              </p>
            ) : (
              <EntityForm action={createAthlete} submitLabel="Add athlete">
                <AthleteFields delegations={delegations} />
              </EntityForm>
            )}
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <AdminSearch
            basePath="/admin/athletes"
            placeholder="Search athletes by name…"
            initialQuery={q}
          />
          <AdminTable
            head={
              <>
                <Th>Athlete</Th>
                <Th>Delegation</Th>
                <Th>Division</Th>
                <Th>Level</Th>
                <Th align="right">Actions</Th>
              </>
            }
            minWidth={720}
          >
            {athletes.map((a) => (
              <Tr key={a.id}>
                <Td className="font-display text-lg font-bold uppercase tracking-wide">
                  {a.first_name} {a.last_name}
                </Td>
                <Td className="font-mono-data text-xs text-ink/60">
                  {a.delegations?.abbrev ?? "—"}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {a.gender}
                </Td>
                <Td className="font-mono-data text-xs uppercase tracking-[0.15em] text-ink/60">
                  {a.level ?? "—"}
                </Td>
                <Td align="right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/athletes/${a.id}`}
                      target="_blank"
                      rel="noopener"
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      View public ↗
                    </Link>
                    <Link
                      href={`/admin/athletes/${a.id}/edit`}
                      className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteAthlete.bind(null, a.id)} itemName={`${a.first_name} ${a.last_name}`} />
                  </div>
                </Td>
              </Tr>
            ))}
          </AdminTable>
          <Pagination
            page={page}
            totalCount={count ?? 0}
            pageSize={PAGE_SIZE_ADMIN}
            basePath="/admin/athletes"
            searchParams={searchParams}
          />
        </div>
      </AdminSection>
    </>
  );
}
