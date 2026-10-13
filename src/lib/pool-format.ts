import { format } from "date-fns";
import type { PoolMemberRef, PoolOrigin } from "@/lib/api";

export function memberName(user: PoolMemberRef) {
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.username;
}

export function memberInitials(user: PoolMemberRef) {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return (user.username?.trim()?.[0] ?? "?").toUpperCase();
}

/** "GH₵1,234.50". Non-finite input renders as GH₵0.00. */
export function formatGhs(amount: number | null | undefined) {
  const value = Number.isFinite(amount) ? (amount as number) : 0;
  const sign = value < 0 ? "-" : "";
  return `${sign}GH₵${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "Oct 13, 2026", or "—" when missing/invalid. */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy");
}

/** "Oct 13, 2026, 4:05 PM", or "—" when missing/invalid. */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy, h:mm a");
}

export function isGroupPool(template: { origin?: PoolOrigin | string | null } | null | undefined) {
  return template?.origin?.toUpperCase() === "GROUP";
}

/** Label for the line that used to read "{tier} Tier". */
export function poolBadge(template: { origin?: PoolOrigin | string | null; tier?: string | null } | null | undefined) {
  if (isGroupPool(template)) return "Group";
  return template?.tier ? `${template.tier} Tier` : null;
}

/**
 * Rates such as `managementFeePercent` and `latePenaltyRate` aren't documented
 * as fraction or percent; values ≤ 1 are treated as fractions (0.05 → "5%").
 */
export function formatRate(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const percent = Math.abs(value) <= 1 ? value * 100 : value;
  return `${Number(percent.toFixed(2))}%`;
}

/** Group pools have their own page; template pools keep `/pools/[id]?type=`. */
export function poolHref(
  poolId: string,
  template: { origin?: PoolOrigin | string | null } | null | undefined,
  type: "active" | "joined"
) {
  return isGroupPool(template) ? `/pools/group/${poolId}` : `/pools/${poolId}?type=${type}`;
}
