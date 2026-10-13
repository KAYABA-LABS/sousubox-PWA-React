import type { PoolMemberRef } from "@/lib/api";

export interface GroupPoolMember {
  userId: string;
  user: PoolMemberRef;
  role: "MEMBER" | "MODERATOR" | string;
  joinedAt: string | null;
}

const str = (value: unknown) => (typeof value === "string" && value ? value : null);

/**
 * `GET /:poolId/members` isn't documented beyond "members with role", so accept
 * either `{ user: {...}, role }` or a flat user record with `role`/`userId`.
 */
export function normalizeMember(raw: Record<string, unknown>): GroupPoolMember | null {
  const nested = raw.user && typeof raw.user === "object" ? (raw.user as Record<string, unknown>) : null;
  const source = nested ?? raw;
  const userId = str(nested?.id) ?? str(raw.userId) ?? str(raw.id);
  if (!userId) return null;
  return {
    userId,
    user: {
      id: userId,
      username: str(source.username) ?? "",
      firstName: str(source.firstName) ?? "",
      lastName: str(source.lastName) ?? "",
      photoUrl: str(source.photoUrl),
    },
    role: str(raw.role) ?? str(raw.memberRole) ?? "MEMBER",
    joinedAt: str(raw.joinedAt) ?? str(raw.createdAt),
  };
}
