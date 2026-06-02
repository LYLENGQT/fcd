"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";
import type { ScheduleStatus } from "@/lib/database.types";

function parse(formData: FormData) {
  const event_id = String(formData.get("event_id") ?? "");
  const venue = String(formData.get("venue") ?? "").trim();
  const startLocal = String(formData.get("start_at") ?? "");
  const status = String(formData.get("status") ?? "scheduled") as ScheduleStatus;
  return { event_id, venue, startLocal, status };
}

export async function createSchedule(formData: FormData): Promise<ActionResult> {
  const { event_id, venue, startLocal, status } = parse(formData);
  if (!event_id || !venue || !startLocal) {
    return { ok: false, error: "Event, venue, and start time are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("schedules").insert({
    event_id,
    venue,
    start_at: new Date(startLocal).toISOString(),
    status,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePublic();
  return { ok: true };
}

export async function updateSchedule(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { event_id, venue, startLocal, status } = parse(formData);
  if (!event_id || !venue || !startLocal) {
    return { ok: false, error: "Event, venue, and start time are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("schedules")
    .update({
      event_id,
      venue,
      start_at: new Date(startLocal).toISOString(),
      status,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/schedule/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

/** Inline status change from the list view. */
export async function updateScheduleStatus(
  id: string,
  status: ScheduleStatus
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("schedules")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePublic();
  return { ok: true };
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/schedule");
  revalidatePublic();
  return { ok: true };
}
