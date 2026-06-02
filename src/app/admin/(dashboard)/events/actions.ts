"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";
import type { EventTypeEnum } from "@/lib/database.types";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const sport_id = String(formData.get("sport_id") ?? "");
  const category_id = String(formData.get("category_id") ?? "");
  const type = String(formData.get("type") ?? "individual") as EventTypeEnum;
  return { name, sport_id, category_id, type };
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const { name, sport_id, category_id, type } = parse(formData);
  if (!name || !sport_id || !category_id) {
    return { ok: false, error: "Name, sport, and category are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .insert({ name, sport_id, category_id, type });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/events");
  revalidatePublic();
  return { ok: true };
}

export async function updateEvent(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { name, sport_id, category_id, type } = parse(formData);
  if (!name || !sport_id || !category_id) {
    return { ok: false, error: "Name, sport, and category are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .update({ name, sport_id, category_id, type })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Cannot delete: results or schedule entries reference this event.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/events");
  revalidatePublic();
  return { ok: true };
}
