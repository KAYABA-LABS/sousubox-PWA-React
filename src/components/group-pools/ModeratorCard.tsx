"use client";

import { ShieldCheck } from "lucide-react";
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { memberName } from "@/lib/pool-format";
import type { GroupPoolModerator } from "@/lib/api";

const TIER_LABELS: Record<string, string> = {
  RESTRICTED: "Restricted",
  STARTER: "Starter",
  TRUSTED: "Trusted",
  GOLD_TRUST: "Gold Trust",
  ELITE: "Elite",
};

export function ModeratorCard({ moderator }: { moderator: GroupPoolModerator }) {
  const stats = moderator.stats;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#FBF6EF] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 p-3">
      <MemberAvatar user={moderator} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Moderator</p>
        <p className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{memberName(moderator)}</p>
        {stats && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {TIER_LABELS[stats.reputationTier] ?? stats.reputationTier} · {stats.poolsModerated}{" "}
            {stats.poolsModerated === 1 ? "pool" : "pools"} moderated
          </p>
        )}
      </div>
      {stats && (
        <div className="flex flex-col items-end shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#0D4F3C] dark:text-[#156B53]" />
          <span className="text-xs font-bold text-[#0C0F14] dark:text-white">{Math.round(stats.reputationScore)}</span>
        </div>
      )}
    </div>
  );
}
