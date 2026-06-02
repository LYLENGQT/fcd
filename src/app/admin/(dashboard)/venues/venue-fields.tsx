import { Input } from "@/components/ui/input";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import type { Venue } from "@/lib/database.types";

/** Shared venue form fields for create + edit. */
export function VenueFields({ venue }: { venue?: Venue }) {
  return (
    <>
      <Field label="Venue name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={venue?.name}
          placeholder="Main Oval"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Address (optional)" htmlFor="address">
        <Input
          id="address"
          name="address"
          defaultValue={venue?.address ?? ""}
          placeholder="City Sports Complex, Passi City"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field
        label="Map URL (optional)"
        htmlFor="map_url"
        hint="A Google Maps share link spectators can tap for directions."
      >
        <Input
          id="map_url"
          name="map_url"
          type="url"
          defaultValue={venue?.map_url ?? ""}
          placeholder="https://maps.google.com/…"
          className={ADMIN_CONTROL}
        />
      </Field>
    </>
  );
}
