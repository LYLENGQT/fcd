"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle. Renders a stable placeholder until mounted so server
 * and client markup match (the real icon depends on the runtime theme).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = theme === "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isLight}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center border border-on-inv/20 text-on-inv/70 transition-colors hover:border-on-inv/40 hover:text-on-inv",
        className,
      )}
    >
      {/* Avoid hydration mismatch: show nothing distinctive until mounted. */}
      {!mounted ? (
        <Sun className="h-[18px] w-[18px] opacity-0" />
      ) : isLight ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <Sun className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
