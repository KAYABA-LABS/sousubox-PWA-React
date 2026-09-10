import type { PoolMemberRef } from "@/lib/api";

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
