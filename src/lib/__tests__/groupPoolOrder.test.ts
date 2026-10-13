import { describe, expect, it } from "vitest";
import { initialOrder, moveItem, needsMyResponse, swapPreview, swappableCycles, swapSide } from "@/lib/groupPoolOrder";
import type { GroupPoolMember } from "@/lib/groupPoolMembers";
import type { PoolTransparency, SwapRequest } from "@/lib/api";

const ref = (id: string) => ({ id, username: id, firstName: id.toUpperCase(), lastName: "", photoUrl: null });
const member = (id: string, joinedAt: string): GroupPoolMember => ({ userId: id, user: ref(id), role: "MEMBER", joinedAt });

describe("moveItem", () => {
  it("moves up and down", () => {
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("clamps at the ends and returns the same array for no-ops", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 5)).toBe(list);
  });
});

describe("initialOrder", () => {
  const members = [member("c", "2026-10-03"), member("a", "2026-10-01"), member("b", "2026-10-02")];

  it("follows the manual order and appends the rest by join date", () => {
    const order = initialOrder(members, [{ position: 1, user: ref("b") }]);
    expect(order.map((m) => m.userId)).toEqual(["b", "a", "c"]);
  });

  it("ignores manual entries for people no longer in the pool", () => {
    const order = initialOrder(members, [{ position: 1, user: ref("gone") }, { position: 2, user: ref("c") }]);
    expect(order.map((m) => m.userId)).toEqual(["c", "a", "b"]);
  });
});

type Timeline = PoolTransparency["payoutTimeline"];
const timeline: Timeline = [1, 2, 3, 4, 5].map((n) => ({
  cycleNumber: n,
  recipient: ref(`u${n}`),
  isMe: false,
  expectedPayoutDate: `2026-10-0${n}`,
  status: n === 1 ? "COMPLETED" : n === 4 ? "COMPLETED" : "PENDING",
}));

describe("swappableCycles", () => {
  it("keeps future, unpaid cycles only (not the current one)", () => {
    expect(swappableCycles(timeline, 2).map((t) => t.cycleNumber)).toEqual([3, 5]);
  });
});

describe("swapPreview", () => {
  it("exchanges the two recipients", () => {
    const preview = swapPreview(timeline, 3, 5);
    expect(preview.find((t) => t.cycleNumber === 3)?.recipient?.id).toBe("u5");
    expect(preview.find((t) => t.cycleNumber === 5)?.recipient?.id).toBe("u3");
    expect(preview.find((t) => t.cycleNumber === 2)?.recipient?.id).toBe("u2");
  });
});

describe("swap responses", () => {
  const swap: SwapRequest = {
    id: "s1",
    cycleA: 3,
    cycleB: 5,
    userA: ref("u3"),
    userB: ref("u5"),
    acceptedAAt: "2026-10-13T10:00:00.000Z",
    acceptedBAt: null,
    status: "PENDING",
    expiresAt: "2026-10-15T10:00:00.000Z",
    proposedBy: "mod",
  };

  it("knows each side", () => {
    expect(swapSide(swap, "u3")).toBe("A");
    expect(swapSide(swap, "u5")).toBe("B");
    expect(swapSide(swap, "x")).toBeNull();
  });

  it("asks only the side that hasn't accepted, while pending", () => {
    expect(needsMyResponse(swap, "u3")).toBe(false);
    expect(needsMyResponse(swap, "u5")).toBe(true);
    expect(needsMyResponse({ ...swap, status: "EXPIRED" }, "u5")).toBe(false);
  });
});
