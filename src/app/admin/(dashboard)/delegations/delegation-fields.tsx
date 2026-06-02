import { Input } from "@/components/ui/input";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Delegation } from "@/lib/database.types";

/** Shared delegation form fields for create + edit. */
export function DelegationFields({ delegation }: { delegation?: Delegation }) {
  return (
    <>
      <Field label="Name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={delegation?.name}
          placeholder="Northbridge"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Abbreviation" htmlFor="abbrev">
        <Input
          id="abbrev"
          name="abbrev"
          required
          maxLength={6}
          defaultValue={delegation?.abbrev}
          placeholder="NBR"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Color" htmlFor="color" hint="Used for tally swatches & accents.">
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue={delegation?.color ?? "#1e40af"}
          className={`${ADMIN_CONTROL} h-10 w-24 p-1`}
        />
      </Field>
      <ImageUploadField
        name="logo_url"
        label="Logo / Crest"
        folder="delegations"
        defaultValue={delegation?.logo_url}
      />
    </>
  );
}
