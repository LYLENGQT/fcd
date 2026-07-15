import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/admin/toast";

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
    <ToastProvider>
      <AdminShell email={profile.email} role={profile.role}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
