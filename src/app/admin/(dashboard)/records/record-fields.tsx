import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import type { MeetRecord } from "@/lib/database.types";

/** Shared Hall of Records form fields for create + edit. */
export function RecordFields({ record }: { record?: MeetRecord }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sport" htmlFor="sport" required>
          <AdminInput
            id="sport"
            name="sport"
            required
            defaultValue={record?.sport}
            placeholder="Athletics"
          />
        </Field>
        <Field label="Event" htmlFor="event_name" required>
          <AdminInput
            id="event_name"
            name="event_name"
            required
            defaultValue={record?.event_name}
            placeholder="100m Dash"
          />
        </Field>
      </div>

      <Field label="Record holder" htmlFor="record_holder" required>
        <AdminInput
          id="record_holder"
          name="record_holder"
          required
          defaultValue={record?.record_holder}
          placeholder="Juan Dela Cruz (or a relay team)"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Delegation (optional)" htmlFor="delegation">
          <AdminInput
            id="delegation"
            name="delegation"
            defaultValue={record?.delegation ?? ""}
            placeholder="Guimbal"
          />
        </Field>
        <Field label="Mark / Time (optional)" htmlFor="mark">
          <AdminInput
            id="mark"
            name="mark"
            defaultValue={record?.mark ?? ""}
            placeholder="11.20s · 5.40m · 152 pts"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Division" htmlFor="level">
          <AdminSelect id="level" name="level" defaultValue={record?.level ?? ""}>
            <option value="">— Division —</option>
            <option value="Elementary">Elementary</option>
            <option value="Secondary">Secondary</option>
            <option value="Open">Open</option>
          </AdminSelect>
        </Field>
        <Field label="Year set (optional)" htmlFor="year_set">
          <AdminInput
            id="year_set"
            name="year_set"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            defaultValue={record?.year_set ?? ""}
            placeholder="2024"
          />
        </Field>
        <Field
          label="Sort order"
          htmlFor="sort_order"
          hint="Lower shows first within a sport."
        >
          <AdminInput
            id="sort_order"
            name="sort_order"
            type="number"
            inputMode="numeric"
            defaultValue={record?.sort_order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}
