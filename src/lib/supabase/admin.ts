import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

/** SERVER-ONLY service-role client. Bypasses RLS — use sparingly and never
 *  in code reachable from the browser bundle. */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createSupabaseClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
