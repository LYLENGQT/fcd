"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/components/admin/entity-form";

export async function deleteFeedback(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("feedback").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/feedback");
  return { ok: true };
}
