"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublic } from "@/lib/revalidate";
import type { ActionResult } from "@/components/admin/entity-form";
import type { GenderDiv, SchoolLevel } from "@/lib/database.types";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const level = String(formData.get("level") ?? "") as SchoolLevel;
  const gender = String(formData.get("gender") ?? "") as GenderDiv;
  return { name, level, gender };
}

const DUP = "A category with that level and division already exists.";

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const { name, level, gender } = parse(formData);
  if (!name || !level || !gender) {
    return { ok: false, error: "Name, level, and division are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, level, gender });
  if (error) return { ok: false, error: error.code === "23505" ? DUP : error.message };

  revalidatePath("/admin/categories");
  revalidatePublic();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const { name, level, gender } = parse(formData);
  if (!name || !level || !gender) {
    return { ok: false, error: "Name, level, and division are required." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, level, gender })
    .eq("id", id);
  if (error) return { ok: false, error: error.code === "23505" ? DUP : error.message };

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePublic();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Cannot delete: events still use this category. Remove them first.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePublic();
  return { ok: true };
}
