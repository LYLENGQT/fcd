"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";
import type { GenderDiv, SchoolLevel } from "@/lib/database.types";

function parse(formData: FormData) {
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const delegation_id = String(formData.get("delegation_id") ?? "");
  const gender = String(formData.get("gender") ?? "mixed") as GenderDiv;
  const levelRaw = String(formData.get("level") ?? "");
  const level = (levelRaw || null) as SchoolLevel | null;
  const photo_url = String(formData.get("photo_url") ?? "").trim() || null;
  return { first_name, last_name, delegation_id, gender, level, photo_url };
}

export async function createAthlete(formData: FormData): Promise<ActionResult> {
  const { first_name, last_name, delegation_id, gender, level, photo_url } =
    parse(formData);
  if (!first_name || !last_name || !delegation_id) {
    return { ok: false, error: "First name, last name, and delegation are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("athletes")
    .insert({ first_name, last_name, delegation_id, gender, level, photo_url });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/athletes");
  revalidatePublic();
  return { ok: true };
}

export async function updateAthlete(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { first_name, last_name, delegation_id, gender, level, photo_url } =
    parse(formData);
  if (!first_name || !last_name || !delegation_id) {
    return { ok: false, error: "First name, last name, and delegation are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("athletes")
    .update({ first_name, last_name, delegation_id, gender, level, photo_url })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/athletes");
  revalidatePath(`/admin/athletes/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteAthlete(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("athletes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/athletes");
  revalidatePublic();
  return { ok: true };
}
