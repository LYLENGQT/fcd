import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { PUBLIC_NAV } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_NAV.map((item) => ({
    url: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/tally" ? "hourly" : "daily",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
