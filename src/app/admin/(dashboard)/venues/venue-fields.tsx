import { Field, AdminInput } from "@/components/admin/admin-ui";
import type { Venue } from "@/lib/database.types";

/** Shared venue form fields for create + edit. */
export function VenueFields({ venue }: { venue?: Venue }) {
  return (
    <>
      <Field label="Venue name" htmlFor="name" required>
        <AdminInput
          id="name"
          name="name"
          required
          defaultValue={venue?.name}
          placeholder="Main Oval"
        />
      </Field>
      <Field label="Address (optional)" htmlFor="address">
        <AdminInput
          id="address"
          name="address"
          defaultValue={venue?.address ?? ""}
          placeholder="City Sports Complex, Passi City"
        />
      </Field>
      <Field
        label="Map URL (optional)"
        htmlFor="map_url"
        hint="A Google Maps share link spectators can tap for directions."
      >
        <AdminInput
          id="map_url"
          name="map_url"
          type="url"
          defaultValue={venue?.map_url ?? ""}
          placeholder="https://maps.google.com/…"
        />
      </Field>
    </>
  );
}
