import { Input } from "@/components/ui/input";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import type { Sport } from "@/lib/database.types";

/** Shared sport form fields for create + edit. */
export function SportFields({ sport }: { sport?: Sport }) {
  return (
    <>
      <Field label="Sport name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={sport?.name}
          placeholder="Athletics"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field
        label="Icon (lucide name, optional)"
        htmlFor="icon"
        hint="e.g. Footprints, Waves, Dribbble — leave blank if unsure."
      >
        <Input
          id="icon"
          name="icon"
          defaultValue={sport?.icon ?? ""}
          placeholder="Footprints"
          className={ADMIN_CONTROL}
        />
      </Field>
    </>
  );
}
