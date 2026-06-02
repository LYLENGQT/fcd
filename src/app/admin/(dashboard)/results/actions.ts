"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import { medalForPlacement } from "@/lib/scoring";
import type { MedalKind } from "@/lib/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

const DUP_ERROR =
  "That athlete (or team) already has a result in this event. Edit the existing row instead.";
const MAX_PLACEMENT = 50;

export async function addResult(formData: FormData): Promise<ActionResult> {
  const event_id = String(formData.get("event_id") ?? "");
  const delegation_id = String(formData.get("delegation_id") ?? "");
  const athlete_id = String(formData.get("athlete_id") ?? "");
  const placement = Number(formData.get("placement") ?? 0);
  const markRaw = String(formData.get("mark") ?? "").trim();
  const medalRaw = String(formData.get("medal") ?? "");

  if (!event_id || !delegation_id || !placement || placement < 1) {
    return { ok: false, error: "Event, delegation, and placement are required." };
  }
  if (placement > MAX_PLACEMENT) {
    return { ok: false, error: `Placement must be ${MAX_PLACEMENT} or lower.` };
  }

  const medal: MedalKind =
    medalRaw && medalRaw !== "auto"
      ? (medalRaw as MedalKind)
      : medalForPlacement(placement);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("results").insert({
    event_id,
    delegation_id,
    athlete_id: athlete_id || null,
    placement,
    medal,
    mark: markRaw || null,
    recorded_by: user?.id ?? null,
  });

  if (error) {
    return { ok: false, error: error.code === "23505" ? DUP_ERROR : error.message };
  }

  revalidatePath(`/admin/results/${event_id}`);
  revalidatePath("/admin/results");
  revalidatePublic([`/results`]);
  return { ok: true };
}

export async function updateResult(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const event_id = String(formData.get("event_id") ?? "");
  const delegation_id = String(formData.get("delegation_id") ?? "");
  const athlete_id = String(formData.get("athlete_id") ?? "");
  const placement = Number(formData.get("placement") ?? 0);
  const markRaw = String(formData.get("mark") ?? "").trim();
  const medalRaw = String(formData.get("medal") ?? "");

  if (!delegation_id || !placement || placement < 1) {
    return { ok: false, error: "Delegation and placement are required." };
  }
  if (placement > MAX_PLACEMENT) {
    return { ok: false, error: `Placement must be ${MAX_PLACEMENT} or lower.` };
  }

  const medal: MedalKind =
    medalRaw && medalRaw !== "auto"
      ? (medalRaw as MedalKind)
      : medalForPlacement(placement);

  const supabase = createClient();
  const { error } = await supabase
    .from("results")
    .update({
      delegation_id,
      athlete_id: athlete_id || null,
      placement,
      medal,
      mark: markRaw || null,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.code === "23505" ? DUP_ERROR : error.message };
  }

  if (event_id) revalidatePath(`/admin/results/${event_id}`);
  revalidatePath("/admin/results");
  revalidatePublic();
  return { ok: true };
}

export async function deleteResult(
  id: string,
  event_id: string
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("results").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/results/${event_id}`);
  revalidatePath("/admin/results");
  revalidatePublic();
  return { ok: true };
}
