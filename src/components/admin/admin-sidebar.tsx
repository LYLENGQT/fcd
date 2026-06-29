"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Trophy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/constants";
import { logout } from "@/app/admin/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserRole } from "@/lib/database.types";

// Encoders get a reduced toolset — they encode results and run the schedule.
const ENCODER_ALLOWED = ["/admin", "/admin/results", "/admin/schedule"];

export function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role: UserRole;
}) {
  const pathname = usePathname();
  const nav =
    role === "encoder"
      ? ADMIN_NAV.filter((i) => ENCODER_ALLOWED.includes(i.href))
      : ADMIN_NAV;
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-on-inv/10 bg-surface-inv text-on-inv">
      <div className="flex items-center gap-2.5 border-b border-on-inv/10 px-5 py-5">
        <Trophy className="h-5 w-5 text-gold" />
        <div className="flex-1">
          <p className="font-display text-lg font-black uppercase leading-none tracking-[0.08em]">
            FCDSA
          </p>
          <p className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.25em] text-on-inv/50">
            {role === "encoder" ? "Encoder Desk" : "Control Desk"}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative block px-3 py-2 font-mono-data text-[11px] uppercase tracking-[0.16em] transition-colors",
                active
                  ? "bg-on-inv/10 text-on-inv"
                  : "text-on-inv/55 hover:bg-on-inv/5 hover:text-on-inv"
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-0.5 bg-gold" />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-on-inv/10 p-3">
        <div className="mb-2.5 flex items-center gap-2.5 px-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-base font-black leading-none text-gold ring-1 ring-gold/30">
            {initial}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-mono-data text-[11px] tracking-[0.02em] text-on-inv/80">
              {email}
            </p>
            <p className="font-mono-data text-[9px] uppercase tracking-[0.22em] text-on-inv/40">
              {role} · signed in
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="mb-2 flex w-full items-center justify-center gap-2 border border-gold/30 px-3 py-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-gold transition hover:border-gold hover:bg-gold/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 border border-on-inv/20 px-3 py-2 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-inv/65 transition hover:border-crimson hover:text-crimson"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
