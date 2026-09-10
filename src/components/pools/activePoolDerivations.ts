import type { ActivePoolContributionEntry, ActivePoolDetails, ActivePoolPayoutEntry } from "@/lib/api";

export type ContributionRingStatus = "paid" | "pending" | "overdue";

/**
 * Defensive status→ring-color mapping. Exact `cycleStatus` enum values from
 * the backend aren't confirmed, so `completed` is trusted for "paid" and
 * `cycleStatus` is only pattern-matched (case-insensitively) for lateness
 * keywords. Single place to fix once real `cycleStatus` values are confirmed
 * against the live API.
 */
export function contributionRingStatus(
  entry: Pick<ActivePoolContributionEntry, "completed" | "cycleStatus">
): ContributionRingStatus {
  if (entry.completed) return "paid";
  const status = (entry.cycleStatus || "").toUpperCase();
  if (status.includes("OVERDUE") || status.includes("LATE") || status.includes("DEFAULT")) return "overdue";
  return "pending";
}

/** Current-cycle member statuses for the avatar strip. Never reads details.members. */
export function currentCycleMemberStatuses(details: ActivePoolDetails): ActivePoolContributionEntry[] {
  return details.contributionTimeline.filter((e) => e.cycleNumber === details.currentCycle);
}

export interface CompletedCycleGroup {
  cycleNumber: number;
  entries: ActivePoolContributionEntry[];
}

/**
 * One row per completed cycle (cycleNumber < currentCycle). Within a row,
 * completed entries come first (preserving backend array order), then
 * non-completed entries. This is a best-effort proxy for "who paid first" —
 * true chronological order needs a backend paidAt-style timestamp that
 * doesn't exist yet.
 */
export function groupCompletedCycles(details: ActivePoolDetails): CompletedCycleGroup[] {
  const byCycle = new Map<number, ActivePoolContributionEntry[]>();
  for (const entry of details.contributionTimeline) {
    if (entry.cycleNumber >= details.currentCycle) continue;
    const list = byCycle.get(entry.cycleNumber) ?? [];
    list.push(entry);
    byCycle.set(entry.cycleNumber, list);
  }
  return [...byCycle.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cycleNumber, entries]) => ({
      cycleNumber,
      entries: [...entries.filter((e) => e.completed), ...entries.filter((e) => !e.completed)],
    }));
}

/** Sorted passthrough of payoutTimeline — kept as its own function so callers have one import surface. */
export function payoutRows(details: ActivePoolDetails): ActivePoolPayoutEntry[] {
  return [...details.payoutTimeline].sort((a, b) => a.cycleNumber - b.cycleNumber);
}
