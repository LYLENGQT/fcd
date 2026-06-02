import { describe, it, expect } from "vitest";
import { medalForPlacement, pointsForMedals, MEDAL_POINTS } from "@/lib/scoring";

describe("medalForPlacement", () => {
  it("maps the podium", () => {
    expect(medalForPlacement(1)).toBe("gold");
    expect(medalForPlacement(2)).toBe("silver");
    expect(medalForPlacement(3)).toBe("bronze");
  });
  it("returns none beyond 3rd", () => {
    expect(medalForPlacement(4)).toBe("none");
    expect(medalForPlacement(99)).toBe("none");
  });
});

describe("pointsForMedals", () => {
  it("uses the 5/3/1 scheme", () => {
    expect(MEDAL_POINTS).toMatchObject({ gold: 5, silver: 3, bronze: 1, none: 0 });
    expect(pointsForMedals(0, 0, 0)).toBe(0);
    expect(pointsForMedals(2, 1, 1)).toBe(14); // 10 + 3 + 1
    expect(pointsForMedals(1, 0, 0)).toBe(5);
  });
});
