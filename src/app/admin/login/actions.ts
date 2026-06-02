"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Invalid login" };
  }

  // Verify staff role (admin or encoder) before allowing into the admin area.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "encoder") {
    await supabase.auth.signOut();
    return { error: "This account does not have staff access." };
  }

  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
