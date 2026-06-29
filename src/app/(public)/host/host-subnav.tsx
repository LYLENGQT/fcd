"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/constants";

/**
 * Horizontal sub-nav for the host microsite — mono-data uppercase tabs with a
 * gold active state, scrolling horizontally on mobile. The "Host" hub (/host)
 * is prepended so the index is always reachable.
 */
export function HostSubNav({ items }: { items: readonly NavLink[] }) {
  const pathname = usePathname();
  const tabs: NavLink[] = [{ href: "/host", label: "Hub" }, ...items];

  const isActive = (href: string) =>
    href === "/host" ? pathname === "/host" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Host municipality sections"
      className="sticky top-16 z-30 border-b border-ink/15 bg-bone/95 backdrop-blur supports-[backdrop-filter]:bg-bone/80"
    >
      <div className="container">
        <div className="-mx-4 flex gap-0.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap px-3.5 py-3.5 font-mono-data text-[11px] uppercase tracking-[0.18em] transition-colors",
                  active ? "text-gold" : "text-ink/55 hover:text-ink"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "absolute inset-x-3.5 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
