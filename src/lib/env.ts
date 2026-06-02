// Centralized env access with clear failure messages.

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when public Supabase env is configured. Used to render a friendly
 *  "configure your env" notice and to skip Realtime when not set up yet. */
export const isSupabaseConfigured = Boolean(rawUrl && rawAnon);

/** Placeholder fallbacks so the Supabase client constructs without throwing when
 *  env is absent (first boot, CI/smoke). Queries then fail soft (empty data)
 *  instead of crashing the page. Real env values always take precedence. */
export const SUPABASE_URL = rawUrl || "http://127.0.0.1:54321";
export const SUPABASE_ANON_KEY = rawAnon || "anon-placeholder-key";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
