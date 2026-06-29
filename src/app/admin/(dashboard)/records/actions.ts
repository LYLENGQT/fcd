"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";

function parse(formData: FormData) {
  const sport = String(formData.get("sport") ?? "").trim();
  const event_name = String(formData.get("event_name") ?? "").trim();
  const record_holder = String(formData.get("record_holder") ?? "").trim();
  const delegation = String(formData.get("delegation") ?? "").trim();
  const mark = String(formData.get("mark") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const yearRaw = String(formData.get("year_set") ?? "").trim();
  const yearNum = Number(yearRaw);
  const sortNum = Number(sortRaw);
  return {
    sport,
    event_name,
    record_holder,
    delegation,
    mark,
    level,
    year_set: yearRaw && Number.isFinite(yearNum) ? Math.trunc(yearNum) : null,
    sort_order: sortRaw && Number.isFinite(sortNum) ? Math.trunc(sortNum) : 0,
  };
}

function validate(v: ReturnType<typeof parse>): string | null {
  if (!v.sport) return "Sport is required.";
  if (!v.event_name) return "Event is required.";
  if (!v.record_holder) return "Record holder is required.";
  return null;
}

export async function createRecord(formData: FormData): Promise<ActionResult> {
  const v = parse(formData);
  const err = validate(v);
  if (err) return { ok: false, error: err };

  const supabase = createClient();
  const { error } = await supabase.from("records").insert(v);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/records");
  revalidatePublic(["/records"]);
  return { ok: true };
}

export async function updateRecord(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const v = parse(formData);
  const err = validate(v);
  if (err) return { ok: false, error: err };

  const supabase = createClient();
  const { error } = await supabase.from("records").update(v).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/records");
  revalidatePath(`/admin/records/${id}/edit`);
  revalidatePublic(["/records"]);
  return { ok: true };
}

export async function deleteRecord(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/records");
  revalidatePublic(["/records"]);
  return { ok: true };
}
