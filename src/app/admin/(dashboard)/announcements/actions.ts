"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const pinned = formData.get("pinned") === "on";
  const published = formData.get("published") === "on";
  return { title, body, pinned, published };
}

export async function createAnnouncement(
  formData: FormData
): Promise<ActionResult> {
  const { title, body, pinned, published } = parse(formData);
  if (!title || !body) return { ok: false, error: "Title and body are required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("announcements")
    .insert({ title, body, pinned, published, author_id: user?.id ?? null });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePublic();
  return { ok: true };
}

export async function updateAnnouncement(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { title, body, pinned, published } = parse(formData);
  if (!title || !body) return { ok: false, error: "Title and body are required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ title, body, pinned, published })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePublic();
  return { ok: true };
}
