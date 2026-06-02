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
    <div className="flex min-h-screen bg-bone text-ink">
      <AdminSidebar email={profile.email} role={profile.role} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
