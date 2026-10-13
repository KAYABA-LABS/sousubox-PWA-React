import type { GroupPoolPreview, PoolTransparency, SwapRequest } from "@/lib/api";
import type { GroupPoolMember } from "@/lib/groupPoolMembers";

/** Moves `list[index]` by `delta` places, clamped to the ends. Returns a new array. */
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = Math.min(list.length - 1, Math.max(0, index + delta));
  if (target === index || index < 0 || index >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/**
 * Starting order for the editor: the saved manual order, then any members it
 * doesn't include in join order (the backend appends left-out members the same way).
 */
export function initialOrder(members: GroupPoolMember[], manualOrder: GroupPoolPreview["manualOrder"] = []): GroupPoolMember[] {
  const byId = new Map(members.map((m) => [m.userId, m]));
  const ordered = [...manualOrder]
    .sort((a, b) => a.position - b.position)
    .map((entry) => byId.get(entry.user.id))
    .filter((m): m is GroupPoolMember => !!m);
  const placed = new Set(ordered.map((m) => m.userId));
  const rest = members
    .filter((m) => !placed.has(m.userId))
    .sort((a, b) => (a.joinedAt ?? "").localeCompare(b.joinedAt ?? ""));
  return [...ordered, ...rest];
}

type TimelineEntry = PoolTransparency["payoutTimeline"][number];

/** Cycles that can still be swapped: after the current one and not already paid. */
export function swappableCycles(timeline: TimelineEntry[], currentCycle: number): TimelineEntry[] {
  return timeline
    .filter((entry) => entry.cycleNumber > currentCycle && entry.status !== "COMPLETED" && entry.status !== "FAILED")
    .sort((a, b) => a.cycleNumber - b.cycleNumber);
}

/** The timeline with the recipients of cycles `a` and `b` exchanged. */
export function swapPreview(timeline: TimelineEntry[], a: number, b: number): TimelineEntry[] {
  const recipientA = timeline.find((t) => t.cycleNumber === a)?.recipient ?? null;
  const recipientB = timeline.find((t) => t.cycleNumber === b)?.recipient ?? null;
  return timeline.map((entry) =>
    entry.cycleNumber === a ? { ...entry, recipient: recipientB } : entry.cycleNumber === b ? { ...entry, recipient: recipientA } : entry
  );
}

/** Which side of a swap the user is on, if any. */
export function swapSide(swap: SwapRequest, userId: string): "A" | "B" | null {
  if (swap.userA.id === userId) return "A";
  if (swap.userB.id === userId) return "B";
  return null;
}

/** A pending swap the user is part of and hasn't accepted yet. */
export function needsMyResponse(swap: SwapRequest, userId: string) {
  if (swap.status !== "PENDING") return false;
  const side = swapSide(swap, userId);
  if (side === "A") return !swap.acceptedAAt;
  if (side === "B") return !swap.acceptedBAt;
  return false;
}
