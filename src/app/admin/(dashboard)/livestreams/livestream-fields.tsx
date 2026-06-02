import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import type { Livestream } from "@/lib/database.types";

/** Shared livestream form fields for create + edit. */
export function LivestreamFields({ stream }: { stream?: Livestream }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={stream?.title}
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field
        label="Video URL"
        htmlFor="embed_url"
        hint="Paste a YouTube watch/share link — it is converted to an embed automatically."
      >
        <Input
          id="embed_url"
          name="embed_url"
          required
          defaultValue={stream?.embed_url}
          placeholder="https://youtube.com/watch?v=…"
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Platform" htmlFor="platform">
        <Select
          id="platform"
          name="platform"
          defaultValue={stream?.platform ?? "youtube"}
          className={ADMIN_CONTROL}
        >
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <label className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70">
        <input
          type="checkbox"
          name="is_live"
          defaultChecked={stream?.is_live ?? false}
          className="accent-crimson"
        />
        Currently live
      </label>
    </>
  );
}
