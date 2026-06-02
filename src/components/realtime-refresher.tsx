"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

/** Subscribes to Postgres changes on a table via Supabase Realtime and refreshes
 *  the current route's server data when something changes. This is the "thin
 *  realtime" for the live medal tally — no custom socket server. */
export function RealtimeRefresher({ table }: { table: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, router]);

  return null;
}
