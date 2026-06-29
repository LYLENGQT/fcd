"use client";

import { useEffect } from "react";

/**
 * Reveals elements tagged `data-reveal` as they scroll into view (one-shot).
 * Adds `.reveal-ready` to <html> on mount so the hidden state only applies when
 * JS is active (no-JS / pre-hydration paints show content normally). Disabled
 * entirely under prefers-reduced-motion. Place once near the top of a page;
 * tag the elements you want to animate with `data-reveal` (use it on
 * below-the-fold elements to avoid a reveal flash).
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("reveal-ready");
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (els.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
