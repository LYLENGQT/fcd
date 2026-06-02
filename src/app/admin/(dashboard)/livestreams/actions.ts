"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";
import type { StreamPlatform } from "@/lib/database.types";

/** Normalize common YouTube watch URLs to embeddable form. */
function toEmbedUrl(raw: string, platform: StreamPlatform): string {
  const url = raw.trim();
  if (platform === "youtube") {
    const m =
      url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) ?? url.match(/([\w-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return url;
}

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawUrl = String(formData.get("embed_url") ?? "").trim();
  const platform = String(formData.get("platform") ?? "youtube") as StreamPlatform;
  const is_live = formData.get("is_live") === "on";
  return { title, rawUrl, platform, is_live };
}

export async function createLivestream(
  formData: FormData
): Promise<ActionResult> {
  const { title, rawUrl, platform, is_live } = parse(formData);
  if (!title || !rawUrl) return { ok: false, error: "Title and URL are required." };

  const supabase = createClient();
  const { error } = await supabase.from("livestreams").insert({
    title,
    embed_url: toEmbedUrl(rawUrl, platform),
    platform,
    is_live,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/livestreams");
  revalidatePublic();
  return { ok: true };
}

export async function updateLivestream(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { title, rawUrl, platform, is_live } = parse(formData);
  if (!title || !rawUrl) return { ok: false, error: "Title and URL are required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("livestreams")
    .update({
      title,
      embed_url: toEmbedUrl(rawUrl, platform),
      platform,
      is_live,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/livestreams");
  revalidatePath(`/admin/livestreams/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteLivestream(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("livestreams").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/livestreams");
  revalidatePublic();
  return { ok: true };
}
