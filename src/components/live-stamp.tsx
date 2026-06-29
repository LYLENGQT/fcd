import { cn } from "@/lib/utils";

/** A small "Updated as of <time>" indicator for pages that claim live data.
 *  Renders the current Philippine time on each server render — paired with
 *  <RealtimeRefresher>, a DB change triggers router.refresh() so this restamps.
 *  Honest by construction: it reflects when the data on screen was fetched. */
export function LiveStamp({
  className,
  showDot = false,
}: {
  className?: string;
  showDot?: boolean;
}) {
  const now = new Date().toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink/50",
        className
      )}
    >
      {showDot && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-crimson pulse-dot" aria-hidden />
      )}
      Updated as of {now} PHT
    </span>
  );
}
