"use client";

import type { GroupPoolStatus } from "@/lib/api";
import { GPChip, type ChipTone } from "./ui";

const POOL_STATUS: Record<GroupPoolStatus, { label: string; tone: ChipTone }> = {
  FORMING: { label: "Forming", tone: "primary" },
  ACTIVE: { label: "Active", tone: "emerald" },
  PAUSED: { label: "Paused", tone: "amber" },
  COMPLETED: { label: "Completed", tone: "gray" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
};

export function PoolStatusChip({ status, className }: { status: GroupPoolStatus | string; className?: string }) {
  const chip = POOL_STATUS[status as GroupPoolStatus] ?? { label: status, tone: "gray" as ChipTone };
  return (
    <GPChip tone={chip.tone} className={className}>
      {chip.label}
    </GPChip>
  );
}
