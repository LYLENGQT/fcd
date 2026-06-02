import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

/** Returns the current user's profile (with role) or null. Server-only.
 *  Resilient to an unreachable/unconfigured backend (returns null rather than
 *  throwing, so callers redirect to login instead of 500-ing). */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
