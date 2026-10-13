import { describe, expect, it } from "vitest";
import { estimatePool, intervalScale } from "@/lib/groupPoolEstimate";

describe("intervalScale", () => {
  it.each([
    [1, 1],
    [7, 1],
    [8, 2],
    [14, 2],
    [30, 5],
  ])("ceil(%i / 7) = %i", (days, scale) => {
    expect(intervalScale(days)).toBe(scale);
  });
});

describe("estimatePool", () => {
  it("weekly pool: daily 20, 10 members", () => {
    expect(estimatePool({ contributionAmount: 20, maxMembers: 10, payoutIntervalDays: 7 })).toEqual({
      scale: 1,
      grossPayoutAmount: 1400, // 20 × 7 × 10
      securityReserve: 60, // 20 × 3 × 1
      joiningFee: 2, // 20 × 0.1
      joinAmount: 62,
      totalPoolValue: 14000, // 20 × 7 × 10 × 10
    });
  });

  it("30-day pool scales the reserve 5× (15 days instead of 3)", () => {
    const estimate = estimatePool({ contributionAmount: 10, maxMembers: 6, payoutIntervalDays: 30 });
    expect(estimate?.scale).toBe(5);
    expect(estimate?.securityReserve).toBe(150);
    expect(estimate?.joinAmount).toBe(151);
    expect(estimate?.grossPayoutAmount).toBe(1800);
    expect(estimate?.totalPoolValue).toBe(10800);
  });

  it("rounds to pesewas", () => {
    expect(estimatePool({ contributionAmount: 3.33, maxMembers: 3, payoutIntervalDays: 1 })?.joiningFee).toBe(0.33);
  });

  it("returns null until inputs are usable", () => {
    expect(estimatePool({ contributionAmount: Number.NaN, maxMembers: 10, payoutIntervalDays: 7 })).toBeNull();
    expect(estimatePool({ contributionAmount: 20, maxMembers: 0, payoutIntervalDays: 7 })).toBeNull();
  });
});
