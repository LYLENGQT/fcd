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
  AdminInput,
  Field,
} from "@/components/admin/admin-ui";
import { EntityForm } from "@/components/admin/entity-form";
import { DeleteButton } from "@/components/admin/delete-button";
import type { EmergencyContact, Committee } from "@/lib/database.types";
import {
  saveMap,
  createEmergencyContact,
  deleteEmergencyContact,
  createCommittee,
  deleteCommittee,
} from "./actions";
import {
  EmergencyContactFields,
  CommitteeFields,
} from "./host-fields";

export const metadata = { title: "Host Info" };

export default async function HostAdminPage() {
  const supabase = createClient();

  const { data: mapRows } = await supabase
    .from("host_map")
    .select("*")
    .limit(1);
  const mapRow = mapRows?.[0] ?? null;

  const { data: contacts } = await supabase
    .from("emergency_contacts")
    .select("*")
    .order("sort_order");
  const emergencyContacts = (contacts ?? []) as EmergencyContact[];

  const { data: committeesData } = await supabase
    .from("committees")
    .select("*")
    .order("sort_order");
  const committees = (committeesData ?? []) as Committee[];

  return (
    <>
      <PageHeader
        watermark="Host"
        eyebrow="Setup · Host Information"
        title={
          <>
            Manage
            <br />
            <span className="text-gold">Host Info</span>
          </>
        }
        intro="Host content pages are hardcoded. Manage the emergency directory, poblacion map, and committee listings below."
      />

      {/* ── Emergency Contacts ────────────────────────────────────── */}
      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight border-b-2 border-ink pb-3 mb-6 lg:hidden">
            Emergency Contacts
          </h2>
          <FormCard title="Add contact">
            <EntityForm
              action={createEmergencyContact}
              submitLabel="Add contact"
              resetOnSuccess
            >
              <EmergencyContactFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight border-b-2 border-ink pb-3 mb-6 max-lg:hidden">
            Emergency Contacts
          </h2>
          {emergencyContacts.length > 0 ? (
            <AdminTable
              head={
                <>
                  <Th>Name</Th>
                  <Th>Number</Th>
                  <Th>Address</Th>
                  <Th>Type</Th>
                  <Th align="right">Actions</Th>
                </>
              }
              minWidth={700}
            >
              {emergencyContacts.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-display text-sm font-bold uppercase tracking-wide">
                    {c.name}
                  </Td>
                  <Td className="font-mono-data text-xs">{c.contact_number}</Td>
                  <Td className="font-mono-data text-xs text-ink/60">
                    {c.address || "—"}
                  </Td>
                  <Td className="font-mono-data text-[10px] uppercase tracking-[0.1em]">
                    {c.contact_type ? (
                      <span className="rounded-none border border-ink/20 bg-bone-2 px-2 py-0.5">
                        {c.contact_type}
                      </span>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/host/emergency/${c.id}/edit`}
                        className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteEmergencyContact.bind(null, c.id)}
                        itemName={c.name}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          ) : (
            <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
              No emergency contacts yet.
            </div>
          )}
        </div>
      </AdminSection>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight border-b-2 border-ink pb-3 mb-6">
            Map Embed
          </h2>
          <FormCard
            title="Poblacion Map"
            description="Paste a Google Maps embed URL (not a regular share link). Open Google Maps → Share → Embed a map → copy the src URL."
          >
            <EntityForm
              action={saveMap}
              submitLabel="Save map"
              resetOnSuccess={false}
            >
              <Field label="Embed URL" htmlFor="embed_url">
                <AdminInput
                  id="embed_url"
                  name="embed_url"
                  required
                  type="url"
                  defaultValue={mapRow?.embed_url ?? ""}
                  placeholder="https://www.google.com/maps/embed?pb=…"
                />
              </Field>
            </EntityForm>
            <p className="mt-3 font-mono-data text-[10px] text-ink/45 leading-relaxed">
              Tip: In Google Maps, click Share → Embed a map → copy the{" "}
              <code className="bg-ink/5 px-1">src</code> URL. Paste it above.
              Regular google.com/maps links will not display in an iframe.
            </p>
          </FormCard>
        </div>
        <div className="lg:col-span-7">
          {mapRow?.embed_url ? (
            <div className="border border-ink/15">
              <iframe
                src={mapRow.embed_url}
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Host map preview"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center border border-ink/15 font-editorial text-xl italic text-ink/40">
              No map set.
            </div>
          )}
        </div>
      </AdminSection>

      {/* ── Committees ─────────────────────────────────────────────── */}
      <AdminSection className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight border-b-2 border-ink pb-3 mb-6 lg:hidden">
            Committees
          </h2>
          <FormCard title="Add committee">
            <EntityForm
              action={createCommittee}
              submitLabel="Add committee"
              resetOnSuccess
            >
              <CommitteeFields />
            </EntityForm>
          </FormCard>
        </div>

        <div className="lg:col-span-8">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight border-b-2 border-ink pb-3 mb-6 max-lg:hidden">
            Committees
          </h2>
          {committees.length > 0 ? (
            <AdminTable
              head={
                <>
                  <Th>Role</Th>
                  <Th>Person</Th>
                  <Th align="right">Actions</Th>
                </>
              }
              minWidth={480}
            >
              {committees.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-display text-sm font-bold uppercase tracking-wide">
                    {c.role_name}
                  </Td>
                  <Td className="font-editorial text-sm">{c.person_name}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/host/committees/${c.id}/edit`}
                        className="font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70 underline-offset-4 hover:text-gold-deep hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCommittee.bind(null, c.id)}
                        itemName={c.role_name}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </AdminTable>
          ) : (
            <div className="border border-ink/15 px-6 py-16 text-center font-editorial text-2xl italic text-ink/45">
              No committees yet.
            </div>
          )}
        </div>
      </AdminSection>
    </>
  );
}
