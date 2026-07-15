import { Field, AdminInput, AdminSelect } from "@/components/admin/admin-ui";
import { isoToInputValue } from "@/lib/utils";
import type { Schedule } from "@/lib/database.types";

type EventOpt = {
  id: string;
  name: string;
  sports: { name: string } | null;
  categories: { name: string } | null;
};

/** Shared schedule form fields for create + edit. */
export function ScheduleFields({
  events,
  schedule,
}: {
  events: EventOpt[];
  schedule?: Schedule;
}) {
  return (
    <>
      <Field label="Event" htmlFor="event_id" required>
        <AdminSelect
          id="event_id"
          name="event_id"
          required
          defaultValue={schedule?.event_id ?? ""}
        >
          <option value="" disabled>
            Select event…
          </option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.sports?.name} — {e.name} ({e.categories?.name})
            </option>
          ))}
        </AdminSelect>
      </Field>
      <Field label="Venue" htmlFor="venue" required>
        <AdminInput
          id="venue"
          name="venue"
          required
          defaultValue={schedule?.venue}
          placeholder="Main Oval"
        />
      </Field>
      <Field label="Start time" htmlFor="start_at" required>
        <AdminInput
          id="start_at"
          name="start_at"
          type="datetime-local"
          required
          defaultValue={schedule ? isoToInputValue(schedule.start_at) : undefined}
        />
      </Field>
      <Field label="Status" htmlFor="status">
        <AdminSelect
          id="status"
          name="status"
          defaultValue={schedule?.status ?? "scheduled"}
        >
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="finished">Finished</option>
          <option value="cancelled">Cancelled</option>
        </AdminSelect>
      </Field>
    </>
  );
}
