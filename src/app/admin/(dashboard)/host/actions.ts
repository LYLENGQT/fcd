"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";

const HOST_PATHS = [
  "/host/overview",
  "/host/accommodation",
  "/host/food-dining",
  "/host/tourist-spots",
  "/host/transportation",
  "/host/map",
  "/host/emergency",
  "/host/committees",
];

function hostRevalidate() {
  revalidatePath("/admin/host");
  revalidatePublic(HOST_PATHS);
}

// ── Host Map ───────────────────────────────────────────────────────────────

export async function saveMap(formData: FormData): Promise<ActionResult> {
  const embed_url = String(formData.get("embed_url") ?? "").trim();

  if (!embed_url) return { ok: false, error: "Embed URL is required." };

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("host_map")
    .select("id")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("host_map")
      .update({ embed_url })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("host_map")
      .insert({ embed_url });
    if (error) return { ok: false, error: error.message };
  }

  hostRevalidate();
  return { ok: true };
}

// ── Emergency Contacts ─────────────────────────────────────────────────────

export async function createEmergencyContact(
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const contact_number = String(formData.get("contact_number") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contact_type = String(formData.get("contact_type") ?? "").trim();

  if (!name) return { ok: false, error: "Name is required." };
  if (!contact_number) return { ok: false, error: "Contact number is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("emergency_contacts")
    .insert({ name, contact_number, address, contact_type });
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}

export async function updateEmergencyContact(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const contact_number = String(formData.get("contact_number") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contact_type = String(formData.get("contact_type") ?? "").trim();

  if (!name) return { ok: false, error: "Name is required." };
  if (!contact_number) return { ok: false, error: "Contact number is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("emergency_contacts")
    .update({ name, contact_number, address, contact_type })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}

export async function deleteEmergencyContact(
  id: string
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}

// ── Committees ─────────────────────────────────────────────────────────────

export async function createCommittee(
  formData: FormData
): Promise<ActionResult> {
  const role_name = String(formData.get("role_name") ?? "").trim();
  const person_name = String(formData.get("person_name") ?? "").trim();

  if (!role_name) return { ok: false, error: "Role name is required." };
  if (!person_name) return { ok: false, error: "Person name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("committees")
    .insert({ role_name, person_name });
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}

export async function updateCommittee(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const role_name = String(formData.get("role_name") ?? "").trim();
  const person_name = String(formData.get("person_name") ?? "").trim();

  if (!role_name) return { ok: false, error: "Role name is required." };
  if (!person_name) return { ok: false, error: "Person name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("committees")
    .update({ role_name, person_name })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}

export async function deleteCommittee(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("committees")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  hostRevalidate();
  return { ok: true };
}
