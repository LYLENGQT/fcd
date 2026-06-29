"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";

export async function saveMascot(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const symbolism = String(formData.get("symbolism") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();

  const supabase = createClient();
  const payload = {
    name,
    tagline,
    description,
    symbolism,
    image_url,
    updated_at: new Date().toISOString(),
  };

  // Single-row table (0007 seeds one row); update it, inserting only as fallback.
  const { data: existing } = await supabase
    .from("mascot")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("mascot")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("mascot").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/mascot");
  revalidatePublic(["/mascot"]);
  return { ok: true };
}
