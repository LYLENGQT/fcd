"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const map_url = String(formData.get("map_url") ?? "").trim() || null;
  return { name, address, map_url };
}

export async function createVenue(formData: FormData): Promise<ActionResult> {
  const { name, address, map_url } = parse(formData);
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("venues")
    .insert({ name, address, map_url });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/venues");
  revalidatePublic(["/venues"]);
  return { ok: true };
}

export async function updateVenue(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { name, address, map_url } = parse(formData);
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("venues")
    .update({ name, address, map_url })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${id}/edit`);
  revalidatePublic(["/venues"]);
  return { ok: true };
}

export async function deleteVenue(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("venues").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/venues");
  revalidatePublic(["/venues"]);
  return { ok: true };
}
