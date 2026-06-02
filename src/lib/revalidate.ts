import { revalidatePath } from "next/cache";

/** Public paths affected by admin data changes. Called after mutations so the
 *  statically-cached public pages refresh on next request (thin realtime). */
export function revalidatePublic(paths: string[] = []) {
  const base = ["/", "/tally", "/schedule", "/delegations", "/athletes", "/announcements", "/livestream"];
  for (const p of new Set([...base, ...paths])) {
    revalidatePath(p);
  }
}
