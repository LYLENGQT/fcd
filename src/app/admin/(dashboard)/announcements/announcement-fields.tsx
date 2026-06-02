import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, ADMIN_CONTROL } from "@/components/admin/admin-ui";
import type { Announcement } from "@/lib/database.types";

/** Shared announcement form fields for create + edit. */
export function AnnouncementFields({
  announcement,
}: {
  announcement?: Announcement;
}) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={announcement?.title}
          className={ADMIN_CONTROL}
        />
      </Field>
      <Field label="Body" htmlFor="body">
        <Textarea
          id="body"
          name="body"
          required
          rows={6}
          defaultValue={announcement?.body}
          className={ADMIN_CONTROL}
        />
      </Field>
      <label className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={announcement?.pinned ?? false}
          className="accent-gold-deep"
        />
        Pin to top
      </label>
      <label className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.15em] text-ink/70">
        <input
          type="checkbox"
          name="published"
          defaultChecked={announcement?.published ?? true}
          className="accent-gold-deep"
        />
        Published
      </label>
    </>
  );
}
