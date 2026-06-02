"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Read the theme the no-flash inline script already applied to <html>. */
function readDomTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Hydrate from the DOM (set pre-paint by ThemeScript) to avoid a flash.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(readDomTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(readDomTheme() === "light" ? "dark" : "light");
  }, [setTheme]);

  // Follow OS changes only while the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (stored !== "light" && stored !== "dark") {
        const next: Theme = e.matches ? "light" : "dark";
        setThemeState(next);
        applyTheme(next);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
