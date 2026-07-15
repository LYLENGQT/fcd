import { Field, AdminInput } from "@/components/admin/admin-ui";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Delegation } from "@/lib/database.types";

/** Shared delegation form fields for create + edit. */
export function DelegationFields({ delegation }: { delegation?: Delegation }) {
  return (
    <>
      <Field label="Name" htmlFor="name" required>
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={delegation?.name}
          placeholder="Oton"
        />
      </Field>
      <Field label="Abbreviation" htmlFor="abbrev" required>
        <AdminInput
          id="abbrev"
          name="abbrev"
          required
          maxLength={6}
          defaultValue={delegation?.abbrev}
          placeholder="OTN"
        />
      </Field>
      <Field label="Color" htmlFor="color" hint="Used for tally swatches & accents.">
        <AdminInput
          id="color"
          name="color"
          type="color"
          defaultValue={delegation?.color ?? "#287f45"}
          className="h-10 w-24 p-1"
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
