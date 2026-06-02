import type { MedalKind } from "@/lib/database.types";

/** Default medal for a finishing placement (1=gold, 2=silver, 3=bronze). */
export function medalForPlacement(placement: number): MedalKind {
  return placement === 1
    ? "gold"
    : placement === 2
      ? "silver"
      : placement === 3
        ? "bronze"
        : "none";
}

/** Championship points per medal. MUST match the `standings` SQL view
 *  (supabase/migrations/0004_features.sql). */
export const MEDAL_POINTS: Record<MedalKind, number> = {
  gold: 5,
  silver: 3,
  bronze: 1,
  none: 0,
};

/** Overall championship points from medal counts. */
export function pointsForMedals(
  gold: number,
  silver: number,
  bronze: number
): number {
  return gold * MEDAL_POINTS.gold + silver * MEDAL_POINTS.silver + bronze * MEDAL_POINTS.bronze;
}
