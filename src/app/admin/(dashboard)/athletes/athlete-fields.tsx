import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Athlete, Delegation } from "@/lib/database.types";

/** Shared athlete form fields for create + edit. */
export function AthleteFields({
  delegations,
  athlete,
}: {
  delegations: Delegation[];
  athlete?: Pick<
    Athlete,
    "first_name" | "last_name" | "delegation_id" | "gender" | "level" | "photo_url"
  >;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="first_name">
          <AdminInput
            id="first_name"
            name="first_name"
            required
            defaultValue={athlete?.first_name}
          />
        </Field>
        <Field label="Last name" htmlFor="last_name">
          <AdminInput
            id="last_name"
            name="last_name"
            required
            defaultValue={athlete?.last_name}
          />
        </Field>
      </div>
      <Field label="Delegation" htmlFor="delegation_id">
        <AdminSelect
          id="delegation_id"
          name="delegation_id"
          required
          defaultValue={athlete?.delegation_id ?? ""}
        >
          <option value="" disabled>
            Select delegation…
          </option>
          {delegations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </AdminSelect>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Division" htmlFor="gender">
          <AdminSelect
            id="gender"
            name="gender"
            defaultValue={athlete?.gender ?? "boys"}
          >
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="mixed">Mixed</option>
          </AdminSelect>
        </Field>
        <Field label="Level" htmlFor="level">
          <AdminSelect
            id="level"
            name="level"
            defaultValue={athlete?.level ?? ""}
          >
            <option value="">—</option>
            <option value="elementary">Elementary</option>
            <option value="secondary">Secondary</option>
          </AdminSelect>
        </Field>
      </div>
      <ImageUploadField
        name="photo_url"
        label="Photo"
        folder="athletes"
        defaultValue={athlete?.photo_url}
      />
    </>
  );
}
