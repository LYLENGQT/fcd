import { Field, AdminInput } from "@/components/admin/admin-ui";
import type { Sport } from "@/lib/database.types";

/** Shared sport form fields for create + edit. */
export function SportFields({ sport }: { sport?: Sport }) {
  return (
    <>
      <Field label="Sport name" htmlFor="name" required>
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={sport?.name}
          placeholder="Athletics"
        />
      </Field>
      <Field
        label="Icon (lucide name, optional)"
        htmlFor="icon"
        hint="e.g. Footprints, Waves, Dribbble — leave blank if unsure."
      >
        <AdminInput
          id="icon"
          name="icon"
          defaultValue={sport?.icon ?? ""}
          placeholder="Footprints"
        />
      </Field>
    </>
  );
}
