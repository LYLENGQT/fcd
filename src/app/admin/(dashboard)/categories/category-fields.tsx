import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import type { Category } from "@/lib/database.types";

/** Shared category form fields for create + edit. */
export function CategoryFields({ category }: { category?: Category }) {
  return (
    <>
      <Field label="Category name" htmlFor="name" required>
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={category?.name}
          placeholder="Secondary Boys"
        />
      </Field>
      <Field label="Level" htmlFor="level" required>
        <AdminSelect
          id="level"
          name="level"
          required
          defaultValue={category?.level ?? ""}
        >
          <option value="" disabled>
            Select level…
          </option>
          <option value="elementary">Elementary</option>
          <option value="secondary">Secondary</option>
        </AdminSelect>
      </Field>
      <Field label="Division" htmlFor="gender" required>
        <AdminSelect
          id="gender"
          name="gender"
          required
          defaultValue={category?.gender ?? ""}
        >
          <option value="" disabled>
            Select division…
          </option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
          <option value="mixed">Mixed</option>
        </AdminSelect>
      </Field>
    </>
  );
}
