import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Where "now" falls relative to the meet window, and which day it is.
 *  Dates are plain YYYY-MM-DD (Asia/Manila); `now` is compared in Manila time
 *  (UTC+8) so the day flips at local midnight, not UTC. */
export function getMeetDay(
  startISO: string,
  endISO: string,
  now: Date
): { day: number; total: number; phase: "before" | "during" | "after" } {
  const DAY = 86_400_000;
  const start = Date.parse(`${startISO}T00:00:00Z`);
  const end = Date.parse(`${endISO}T00:00:00Z`);
  const total = Math.round((end - start) / DAY) + 1;
  const manilaToday = Date.parse(
    `${new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10)}T00:00:00Z`
  );
  if (manilaToday < start) return { day: 0, total, phase: "before" };
  if (manilaToday > end) return { day: total, total, phase: "after" };
  return {
    day: Math.round((manilaToday - start) / DAY) + 1,
    total,
    phase: "during",
  };
}

/** URL-safe slug from a display name (lowercase, hyphenated). */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Format an ISO timestamp for display in Philippine time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    dateStyle: "full",
    timeZone: "Asia/Manila",
  });
}

/** ISO → value for a <input type="datetime-local">. Formats in UTC so it
 *  round-trips with the schedule create/update actions (which do
 *  `new Date(input).toISOString()` on the UTC server). */
export function isoToInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PH", {
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
}

/** Parse a `?page` search param into a safe 1-based page number. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** Zero-based Supabase `.range()` bounds for a 1-based page. */
export function pageRange(
  page: number,
  pageSize: number,
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}
