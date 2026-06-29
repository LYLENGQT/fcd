import { Field, AdminInput } from "@/components/admin/admin-ui";
import type { EmergencyContact, Committee } from "@/lib/database.types";

export function EmergencyContactFields({
  contact,
}: {
  contact?: EmergencyContact;
}) {
  return (
    <>
      <Field label="Name" htmlFor="name">
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={contact?.name}
          placeholder="Passi City Police Station"
        />
      </Field>
      <Field label="Contact number" htmlFor="contact_number">
        <AdminInput
          id="contact_number"
          name="contact_number"
          required
          defaultValue={contact?.contact_number}
          placeholder="0917-123-4567"
        />
      </Field>
      <Field label="Address (optional)" htmlFor="address">
        <AdminInput
          id="address"
          name="address"
          defaultValue={contact?.address ?? ""}
          placeholder="Rizal St., Passi City"
        />
      </Field>
      <Field label="Type (optional)" htmlFor="contact_type">
        <AdminInput
          id="contact_type"
          name="contact_type"
          defaultValue={contact?.contact_type ?? ""}
          placeholder="Police / Hospital / Fire / etc."
        />
      </Field>
    </>
  );
}

export function CommitteeFields({
  committee,
}: {
  committee?: Committee;
}) {
  return (
    <>
      <Field label="Role" htmlFor="role_name">
        <AdminInput
          id="role_name"
          name="role_name"
          required
          defaultValue={committee?.role_name}
          placeholder="Tournament Manager"
        />
      </Field>
      <Field label="Person" htmlFor="person_name">
        <AdminInput
          id="person_name"
          name="person_name"
          required
          defaultValue={committee?.person_name}
          placeholder="Juan Dela Cruz"
        />
      </Field>
    </>
  );
}
