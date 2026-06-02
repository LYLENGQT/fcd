import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/** Refreshes the Supabase session cookie and gates /admin routes.
 *  Returns the response to send. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without env configured, skip auth work (lets the app boot for first setup).
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin");
  const isLoginPage = path === "/admin/login";

  // Unauthenticated user hitting a protected admin route → login.
  if (isAdminArea && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Role gating for the admin area.
  if (isAdminArea && !isLoginPage && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role;

    // Neither admin nor encoder → not staff, bounce home.
    if (role !== "admin" && role !== "encoder") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Encoders may ONLY reach the dashboard, results encoding, and schedule.
    // Everything else (setup/CRUD, audit) is admin-only.
    if (role === "encoder") {
      const encoderAllowed =
        path === "/admin" ||
        path.startsWith("/admin/results") ||
        path.startsWith("/admin/schedule");
      if (!encoderAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/results";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
