"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { memberInitials, memberName } from "@/lib/pool-format";
import type { PoolMemberRef } from "@/lib/api";
import type { ContributionRingStatus } from "./activePoolDerivations";

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-10 h-10 text-xs",
} as const;

const RING_CLASSES: Record<ContributionRingStatus, string> = {
  paid: "ring-2 ring-sb-brand-500 dark:ring-sb-brand-400",
  pending: "ring-2 ring-amber-500 dark:ring-amber-400",
  overdue: "ring-2 ring-red-500 dark:ring-red-400",
};

interface MemberAvatarProps {
  user: PoolMemberRef;
  status?: ContributionRingStatus;
  size?: keyof typeof SIZE_CLASSES;
  muted?: boolean;
  className?: string;
}

export function MemberAvatar({ user, status, size = "sm", muted, className }: MemberAvatarProps) {
  const name = memberName(user);
  return (
    <Avatar
      role="img"
      aria-label={name}
      className={cn(
        SIZE_CLASSES[size],
        "ring-offset-2 ring-offset-white dark:ring-offset-sb-surface",
        status && RING_CLASSES[status],
        muted && "opacity-50 grayscale",
        className
      )}
    >
      {user.photoUrl && <AvatarImage src={user.photoUrl} alt={name} />}
      <AvatarFallback className="bg-sb-brand-800/10 dark:bg-sb-brand-700/15 text-sb-brand-600 font-bold">
        {memberInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
