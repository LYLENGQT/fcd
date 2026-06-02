"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/components/admin/entity-form";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  return { name, icon };
}

export async function createSport(formData: FormData): Promise<ActionResult> {
  const { name, icon } = parse(formData);
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("sports")
    .insert({ name, slug: slugify(name), icon: icon || null });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sports");
  revalidatePublic();
  return { ok: true };
}

export async function updateSport(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { name, icon } = parse(formData);
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("sports")
    .update({ name, slug: slugify(name), icon: icon || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/sports");
  revalidatePath(`/admin/sports/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteSport(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("sports").delete().eq("id", id);
  if (error) {
    // FK violation when events still reference this sport.
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Cannot delete: events still reference this sport. Remove them first.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/sports");
  revalidatePublic();
  return { ok: true };
}
