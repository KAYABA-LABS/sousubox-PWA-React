import { describe, expect, it } from "vitest";
import { formatDate, formatGhs, formatRate, isGroupPool, poolBadge } from "@/lib/pool-format";

describe("poolBadge", () => {
  it("labels group pools as Group even if a tier is present", () => {
    expect(poolBadge({ origin: "GROUP", tier: null })).toBe("Group");
    expect(poolBadge({ origin: "GROUP", tier: "GOLD" })).toBe("Group");
  });

  it("labels template pools by tier", () => {
    expect(poolBadge({ origin: "TEMPLATE", tier: "GOLD" })).toBe("GOLD Tier");
    expect(poolBadge({ tier: "SILVER" })).toBe("SILVER Tier");
  });

  it("returns null rather than 'null Tier'", () => {
    expect(poolBadge({ tier: null })).toBeNull();
    expect(poolBadge(undefined)).toBeNull();
  });

  it("isGroupPool is case-insensitive", () => {
    expect(isGroupPool({ origin: "group" })).toBe(true);
    expect(isGroupPool({})).toBe(false);
  });
});

describe("formatGhs", () => {
  it("formats with the cedi sign, separators and two decimals", () => {
    expect(formatGhs(1234.5)).toBe("GH₵1,234.50");
    expect(formatGhs(0)).toBe("GH₵0.00");
    expect(formatGhs(-20)).toBe("-GH₵20.00");
  });

  it("treats missing values as zero", () => {
    expect(formatGhs(null)).toBe("GH₵0.00");
    expect(formatGhs(Number.NaN)).toBe("GH₵0.00");
  });
});

describe("formatRate", () => {
  it("treats values ≤ 1 as fractions", () => {
    expect(formatRate(0.05)).toBe("5%");
    expect(formatRate(0.125)).toBe("12.5%");
  });

  it("passes whole percents through", () => {
    expect(formatRate(5)).toBe("5%");
  });
});

describe("formatDate", () => {
  it("renders a dash for missing or invalid dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not a date")).toBe("—");
  });
});
