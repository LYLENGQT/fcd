"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Trophy } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserRole } from "@/lib/database.types";

/**
 * Admin shell: static sidebar on desktop, slide-in drawer on mobile behind a
 * hamburger top bar. Holds the drawer open/close state; the sidebar itself is
 * shared between both layouts.
 */
export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex min-h-dvh bg-bone text-ink">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-on-inv/10 bg-surface-inv px-4 py-3 text-on-inv md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.2em] text-on-inv/80 transition-colors hover:text-on-inv"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
        <span className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-[0.08em]">
          <Trophy className="h-4 w-4 text-gold" />
          FCDSA
        </span>
        <ThemeToggle />
      </header>

      {/* Drawer backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <AdminSidebar
        email={email}
        role={role}
        open={open}
        onClose={() => setOpen(false)}
      />

      <main
        id="main"
        tabIndex={-1}
        className="flex-1 overflow-x-hidden pt-14 focus:outline-none md:pt-0"
      >
        {children}
      </main>
    </div>
  );
}
