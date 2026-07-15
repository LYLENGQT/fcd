"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { ADMIN_CONTROL } from "@/components/admin/admin-ui";
import { useToast } from "@/components/admin/toast";
import { updateScheduleStatus } from "./actions";
import type { ScheduleStatus } from "@/lib/database.types";

const STATUSES: ScheduleStatus[] = ["scheduled", "ongoing", "finished", "cancelled"];

export function StatusSelect({
  id,
  current,
}: {
  id: string;
  current: ScheduleStatus;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Event status"
      className={`${ADMIN_CONTROL} h-8 w-32`}
      defaultValue={current}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          const next = e.target.value as ScheduleStatus;
          await updateScheduleStatus(id, next);
          toast(`Status set to ${next}`);
          router.refresh();
        })
      }
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Select>
  );
}
