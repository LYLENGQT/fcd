import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Server-side guard (defense in depth alongside middleware). Every page in this
// group requires an authenticated admin.
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "admin" && profile.role !== "encoder") redirect("/");

  return (
    <div className="flex min-h-dvh bg-bone text-ink">
      <AdminSidebar email={profile.email} role={profile.role} />
      <main id="main" tabIndex={-1} className="flex-1 overflow-x-hidden focus:outline-none">
        {children}
      </main>
    </div>
  );
}
