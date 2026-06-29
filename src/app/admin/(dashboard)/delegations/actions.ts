"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/components/admin/entity-form";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const abbrev = String(formData.get("abbrev") ?? "").trim();
  const color = String(formData.get("color") ?? "#287f45");
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  return { name, abbrev, color, logo_url };
}

export async function createDelegation(
  formData: FormData
): Promise<ActionResult> {
  const { name, abbrev, color, logo_url } = parse(formData);
  if (!name || !abbrev) {
    return { ok: false, error: "Name and abbreviation are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("delegations")
    .insert({ name, abbrev, color, logo_url, slug: slugify(name) });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/delegations");
  revalidatePublic();
  return { ok: true };
}

export async function updateDelegation(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { name, abbrev, color, logo_url } = parse(formData);
  if (!name || !abbrev) {
    return { ok: false, error: "Name and abbreviation are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("delegations")
    .update({ name, abbrev, color, logo_url, slug: slugify(name) })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/delegations");
  revalidatePath(`/admin/delegations/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteDelegation(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("delegations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/delegations");
  revalidatePublic();
  return { ok: true };
}
