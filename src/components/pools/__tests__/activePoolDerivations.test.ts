import { describe, expect, it } from "vitest";
import { contributionRingStatus, payoutStatusMap } from "@/components/pools/activePoolDerivations";
import { poolHref } from "@/lib/pool-format";

describe("contributionRingStatus", () => {
  it.each([
    [{ completed: true, cycleStatus: "COMPLETED_LATE" }, "paid"],
    [{ completed: false, cycleStatus: "UNCOVERED" }, "uncovered"],
    [{ completed: false, cycleStatus: "uncovered" }, "uncovered"],
    [{ completed: false, cycleStatus: "MISSED" }, "pending"],
    [{ completed: false, cycleStatus: "COMPLETED_LATE" }, "overdue"],
    [{ completed: false, cycleStatus: "PENDING" }, "pending"],
  ] as const)("%j → %s", (entry, expected) => {
    expect(contributionRingStatus(entry)).toBe(expected);
  });
});

describe("payoutStatusMap", () => {
  it("indexes the transparency timeline by cycle", () => {
    const map = payoutStatusMap({
      payoutTimeline: [
        { cycleNumber: 1, recipient: null, isMe: false, expectedPayoutDate: "2026-10-01", status: "COMPLETED" },
        { cycleNumber: 2, recipient: null, isMe: true, expectedPayoutDate: "2026-10-08", status: "HOLD" },
        { cycleNumber: 3, recipient: null, isMe: false, expectedPayoutDate: "2026-10-15", status: "FAILED" },
      ],
    });
    expect(map.get(2)).toBe("HOLD");
    expect(map.get(3)).toBe("FAILED");
    expect(map.get(4)).toBeUndefined();
  });

  it("is empty without transparency (template pools)", () => {
    expect(payoutStatusMap(null).size).toBe(0);
  });
});

describe("poolHref", () => {
  it("routes by origin", () => {
    expect(poolHref("p1", { origin: "GROUP" }, "active")).toBe("/pools/group/p1");
    expect(poolHref("p1", { origin: "TEMPLATE" }, "joined")).toBe("/pools/p1?type=joined");
    expect(poolHref("p1", undefined, "active")).toBe("/pools/p1?type=active");
  });
});
