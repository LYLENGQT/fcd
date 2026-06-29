import {
  Field,
  AdminInput,
  AdminSelect,
  AdminCheckbox,
} from "@/components/admin/admin-ui";
import type { Livestream } from "@/lib/database.types";

/** Shared livestream form fields for create + edit. */
export function LivestreamFields({ stream }: { stream?: Livestream }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <AdminInput
          id="title"
          name="title"
          required
          defaultValue={stream?.title}
        />
      </Field>
      <Field
        label="Video URL"
        htmlFor="embed_url"
        hint="Paste a YouTube watch/share link — it is converted to an embed automatically."
      >
        <AdminInput
          id="embed_url"
          name="embed_url"
          required
          defaultValue={stream?.embed_url}
          placeholder="https://youtube.com/watch?v=…"
        />
      </Field>
      <Field label="Platform" htmlFor="platform">
        <AdminSelect
          id="platform"
          name="platform"
          defaultValue={stream?.platform ?? "youtube"}
        >
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
          <option value="other">Other</option>
        </AdminSelect>
      </Field>
      <AdminCheckbox
        name="is_live"
        label="Currently live"
        defaultChecked={stream?.is_live ?? false}
      />
    </>
  );
}
