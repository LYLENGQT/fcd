"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/** Browser-side Supabase client (anon key, subject to RLS). */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
