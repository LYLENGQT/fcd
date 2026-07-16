"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PUBLIC_NAV_GROUPS,
  isNavGroup,
  type NavLink as NavLinkT,
} from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groupActive = (items: readonly NavLinkT[]) =>
    items.some((i) => isActive(i.href));

  // Close everything on navigation.
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  // Desktop dropdown: close on outside-click and Escape.
  useEffect(() => {
    if (!openGroup) return;
    function onDown(e: MouseEvent) {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenGroup(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex items-center">
      {/* ── Desktop nav ─────────────────────────────────────────────── */}
      <div ref={desktopRef} className="hidden items-center gap-0.5 lg:flex">
        {PUBLIC_NAV_GROUPS.map((entry) => {
          if (!isNavGroup(entry)) {
            const active = isActive(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "relative px-3.5 py-2 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors",
                  active ? "text-gold" : "text-on-inv/70 hover:text-on-inv"
                )}
              >
                {entry.label}
                <span
                  className={cn(
                    "absolute inset-x-3.5 -bottom-px h-px origin-left bg-gold transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          }

          const active = groupActive(entry.items);
          const open = openGroup === entry.label;
          const panelId = `nav-${entry.label.toLowerCase()}`;

          return (
            <div
              key={entry.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(entry.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={panelId}
                // Open (idempotent) rather than toggle: on pointer devices
                // mouseenter has already opened it, so a toggle here would
                // immediately close it. Hover-leave / Escape / outside-click close.
                onClick={() => setOpenGroup(entry.label)}
                className={cn(
                  "relative flex items-center gap-1 px-3.5 py-2 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors",
                  active || open ? "text-gold" : "text-on-inv/70 hover:text-on-inv"
                )}
              >
                {entry.label}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-3.5 -bottom-px h-px origin-left bg-gold transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </button>

              {open && (
                <div
                  id={panelId}
                  className="absolute left-1/2 top-full z-50 min-w-[12rem] -translate-x-1/2 border border-on-inv/15 bg-surface-inv shadow-xl shadow-black/25 duration-150 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1"
                >
                  <span className="block h-0.5 w-full bg-gold" />
                  <div className="py-1.5">
                    {entry.items.map((item) => {
                      const a = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block whitespace-nowrap px-4 py-2.5 font-mono-data text-[11px] uppercase tracking-[0.16em] transition-colors",
                            a
                              ? "text-gold"
                              : "text-on-inv/70 hover:bg-on-inv/5 hover:text-on-inv"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Link
          href="/admin"
          className={cn(
            "ml-2 border px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.2em] transition-colors",
            pathname.startsWith("/admin")
              ? "border-gold text-gold"
              : "border-on-inv/25 text-on-inv/70 hover:border-gold hover:text-gold"
          )}
        >
          Admin
        </Link>
        <ThemeToggle className="ml-2" />
      </div>

      {/* ── Mobile controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 lg:hidden">
        <ThemeToggle />
        <button
          className="-mr-2 flex h-11 w-11 items-center justify-center text-on-inv"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile drawer: right-side slide-in panel + dimmed backdrop ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm duration-150 animate-in fade-in-0 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(80vw,20rem)] flex-col overflow-y-auto border-l border-on-inv/10 bg-surface-inv text-on-inv shadow-2xl shadow-black/40 duration-200 animate-in slide-in-from-right lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-on-inv/10 px-5 py-4">
              <span className="font-mono-data text-[11px] uppercase tracking-[0.3em] text-on-inv/55">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="-mr-2 flex h-11 w-11 items-center justify-center text-on-inv/70 transition-colors hover:text-on-inv"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col px-5 pb-8 pt-1">
              {PUBLIC_NAV_GROUPS.map((entry) => {
                if (!isNavGroup(entry)) {
                  const active = isActive(entry.href);
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={cn(
                        "flex min-h-[44px] items-center border-b border-on-inv/5 py-2 font-mono-data text-xs uppercase tracking-[0.2em]",
                        active ? "text-gold" : "text-on-inv/80"
                      )}
                    >
                      {entry.label}
                    </Link>
                  );
                }
                return (
                  <div
                    key={entry.label}
                    className="border-b border-on-inv/5 py-3"
                  >
                    <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-inv/40">
                      {entry.label}
                    </p>
                    <div className="mt-1 flex flex-col">
                      {entry.items.map((item) => {
                        const a = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex min-h-[44px] items-center justify-between py-2 pl-3 font-mono-data text-xs uppercase tracking-[0.18em]",
                              a ? "text-gold" : "text-on-inv/75"
                            )}
                          >
                            {item.label}
                            {a && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <Link
                href="/admin"
                className="mt-4 inline-flex w-fit items-center gap-2 border border-gold/50 px-3 py-2 font-mono-data text-xs uppercase tracking-[0.2em] text-gold"
              >
                Admin Desk
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
