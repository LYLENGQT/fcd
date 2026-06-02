import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import type { Category, EventRow, Sport } from "@/lib/database.types";

/** Shared event form fields for create + edit. */
export function EventFields({
  sports,
  categories,
  event,
}: {
  sports: Sport[];
  categories: Category[];
  event?: EventRow;
}) {
  return (
    <>
      <Field label="Event name" htmlFor="name">
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={event?.name}
          placeholder="100m Dash"
        />
      </Field>
      <Field label="Sport" htmlFor="sport_id">
        <AdminSelect
          id="sport_id"
          name="sport_id"
          required
          defaultValue={event?.sport_id ?? ""}
        >
          <option value="" disabled>
            Select sport…
          </option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </AdminSelect>
      </Field>
      <Field label="Category" htmlFor="category_id">
        <AdminSelect
          id="category_id"
          name="category_id"
          required
          defaultValue={event?.category_id ?? ""}
        >
          <option value="" disabled>
            Select category…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </AdminSelect>
      </Field>
      <Field label="Type" htmlFor="type">
        <AdminSelect
          id="type"
          name="type"
          defaultValue={event?.type ?? "individual"}
        >
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </AdminSelect>
      </Field>
    </>
  );
}
