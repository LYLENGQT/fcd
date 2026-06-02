import { describe, it, expect } from "vitest";
import {
  slugify,
  isoToInputValue,
  parsePage,
  pageRange,
  getMeetDay,
} from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Central City")).toBe("central-city");
  });
  it("strips punctuation and trims stray hyphens", () => {
    expect(slugify("  Foo!! Bar ")).toBe("foo-bar");
  });
  it("collapses runs of non-alphanumerics", () => {
    expect(slugify("A — B / C")).toBe("a-b-c");
  });
});

describe("isoToInputValue", () => {
  it("formats to a datetime-local value in UTC (round-trips with the action)", () => {
    expect(isoToInputValue("2026-05-31T08:00:00.000Z")).toBe("2026-05-31T08:00");
  });
});

describe("parsePage", () => {
  it("defaults to 1 for missing/invalid input", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("-4")).toBe(1);
    expect(parsePage("0")).toBe(1);
  });
  it("parses a valid page and the first of an array", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["5", "x"])).toBe(5);
  });
});

describe("pageRange", () => {
  it("computes zero-based supabase range bounds", () => {
    expect(pageRange(1, 20)).toEqual({ from: 0, to: 19 });
    expect(pageRange(3, 12)).toEqual({ from: 24, to: 35 });
  });
});

describe("getMeetDay", () => {
  const START = "2026-10-14";
  const END = "2026-10-28"; // 15 days inclusive

  it("reports 'before' with day 0 ahead of the meet", () => {
    expect(getMeetDay(START, END, new Date("2026-05-31T00:00:00Z"))).toEqual({
      day: 0,
      total: 15,
      phase: "before",
    });
  });
  it("counts the day during the meet", () => {
    expect(getMeetDay(START, END, new Date("2026-10-16T05:00:00Z"))).toMatchObject({
      day: 3,
      phase: "during",
    });
  });
  it("flips at Manila midnight, not UTC", () => {
    // 16:30Z on Oct 13 is 00:30 Oct 14 in Manila → day 1.
    expect(getMeetDay(START, END, new Date("2026-10-13T16:30:00Z"))).toMatchObject({
      day: 1,
      phase: "during",
    });
  });
  it("clamps to the final day after the meet", () => {
    expect(getMeetDay(START, END, new Date("2026-11-02T00:00:00Z"))).toEqual({
      day: 15,
      total: 15,
      phase: "after",
    });
  });
});
