import { createClient } from "@/lib/supabase/server";
import type { MedalTallyRow, StandingsRow } from "@/lib/database.types";

/** Medal tally rows, ranked. Reads the derived `medal_tally` view. */
export async function getTally(): Promise<MedalTallyRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("medal_tally")
    .select("*")
    .order("rank", { ascending: true })
    // Stable secondary sort so tied delegations keep a consistent row order.
    .order("delegation_name", { ascending: true });
  return (data ?? []) as MedalTallyRow[];
}

/** Overall championship standings (points), ranked. Reads the `standings`
 *  view (gold=5, silver=3, bronze=1). */
export async function getStandings(): Promise<StandingsRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("standings")
    .select("*")
    .order("rank", { ascending: true })
    // Stable secondary sort so tied delegations keep a consistent row order.
    .order("delegation_name", { ascending: true });
  return (data ?? []) as StandingsRow[];
}
