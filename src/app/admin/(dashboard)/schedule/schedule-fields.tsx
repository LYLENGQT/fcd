import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
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
      <Field label="Event" htmlFor="event_id">
        <Select
          id="event_id"
          name="event_id"
          required
          defaultValue={schedule?.event_id ?? ""}
          className={ADMIN_CONTROL}
        >
          <option value="" disabled>
            Select event…
          </option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.sports?.name} — {e.name} ({e.categories?.name})
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Venue" htmlFor="venue">
        <Input
          id="venue"
          name="venue"
          required
          defaultValue={schedule?.venue}
          placeholder="Main Oval"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Start time" htmlFor="start_at">
        <Input
          id="start_at"
          name="start_at"
          type="datetime-local"
          required
          defaultValue={schedule ? isoToInputValue(schedule.start_at) : undefined}
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select
          id="status"
          name="status"
          defaultValue={schedule?.status ?? "scheduled"}
          className={ADMIN_CONTROL}
        >
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="finished">Finished</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Field>
    </>
  );
}
