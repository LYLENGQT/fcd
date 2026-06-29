import { cn } from "@/lib/utils";
import type { ScheduleStatus } from "@/lib/database.types";

const STYLES: Record<ScheduleStatus, string> = {
  scheduled: "border-ink/25 text-ink/70",
  ongoing: "border-crimson bg-crimson/10 text-crimson",
  finished: "border-jade/50 bg-jade/10 text-jade",
  cancelled: "border-ink/15 text-ink/35 line-through",
};

const LABEL: Record<ScheduleStatus, string> = {
  scheduled: "Scheduled",
  ongoing: "Live",
  finished: "Final",
  cancelled: "Cancelled",
};

const TITLE: Record<ScheduleStatus, string> = {
  scheduled: "Scheduled",
  ongoing: "In progress",
  finished: "Event finished",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: ScheduleStatus }) {
  return (
    <span
      title={TITLE[status]}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-[0.18em]",
        STYLES[status]
      )}
    >
      {status === "ongoing" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-crimson pulse-dot" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-crimson" />
        </span>
      )}
      {LABEL[status]}
    </span>
  );
}
