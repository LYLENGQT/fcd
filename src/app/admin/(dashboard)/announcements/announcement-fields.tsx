import {
  Field,
  AdminInput,
  AdminTextarea,
  AdminCheckbox,
} from "@/components/admin/admin-ui";
import type { Announcement } from "@/lib/database.types";

/** Shared announcement form fields for create + edit. */
export function AnnouncementFields({
  announcement,
}: {
  announcement?: Announcement;
}) {
  return (
    <>
      <Field label="Title" htmlFor="title" required>
        <AdminInput
          id="title"
          name="title"
          required
          defaultValue={announcement?.title}
        />
      </Field>
      <Field label="Body" htmlFor="body" required>
        <AdminTextarea
          id="body"
          name="body"
          required
          rows={6}
          defaultValue={announcement?.body}
        />
      </Field>
      <AdminCheckbox
        name="pinned"
        label="Pin to top"
        defaultChecked={announcement?.pinned ?? false}
      />
      <AdminCheckbox
        name="published"
        label="Published"
        defaultChecked={announcement?.published ?? true}
      />
    </>
  );
}
