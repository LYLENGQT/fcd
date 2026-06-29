"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/components/admin/entity-form";

export async function submitFeedback(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim();

  if (!message) return { ok: false, error: "Please enter a message." };
  if (message.length > 4000) {
    return { ok: false, error: "Message is too long (max 4000 characters)." };
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email, or leave it blank." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("feedback")
    .insert({ name, email, subject, message });
  if (error) {
    return { ok: false, error: "Could not send feedback. Please try again." };
  }

  return { ok: true };
}
