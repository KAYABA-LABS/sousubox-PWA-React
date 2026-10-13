"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { groupPoolsEnabled } from "@/lib/featureFlags";
import { useModeratorStore } from "@/stores/useModeratorStore";
import type { ModeratorStatus } from "@/lib/api";
import { GPChip, type ChipTone } from "./ui";

const STATUS_CHIPS: Record<ModeratorStatus, { label: string; tone: ChipTone }> = {
  NONE: { label: "Apply", tone: "gray" },
  PENDING: { label: "In review", tone: "amber" },
  APPROVED: { label: "Active", tone: "emerald" },
  REJECTED: { label: "Not approved", tone: "gray" },
  SUSPENDED: { label: "Suspended", tone: "red" },
  REVOKED: { label: "Revoked", tone: "red" },
};

/** Profile entry into the moderator area (plan decision 3). */
export function ModeratorProfileRow({ className }: { className?: string }) {
  const router = useRouter();
  const status = useModeratorStore((s) => s.status);
  if (!groupPoolsEnabled) return null;
  const chip = status ? STATUS_CHIPS[status] : null;

  return (
    <button onClick={() => router.push("/moderator")} className={`w-full flex items-center gap-2.5 p-4 text-left ${className ?? ""}`}>
      <span className="w-9 h-9 rounded-full bg-[#E6EEEC] dark:bg-[#156B53]/20 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-[17px] h-[17px] text-[#0D4F3C] dark:text-[#1F8C6C]" strokeWidth={1.6} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-bold tracking-tight">Pool Moderator</span>
        <span className="block text-[12px] text-[#6E788A] dark:text-gray-400">Run an invite-only pool for your group</span>
      </span>
      {chip && <GPChip tone={chip.tone}>{chip.label}</GPChip>}
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </button>
  );
}
