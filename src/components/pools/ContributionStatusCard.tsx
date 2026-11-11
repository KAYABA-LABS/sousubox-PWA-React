"use client";

import { cn } from "@/lib/utils";
import { MemberAvatar } from "./MemberAvatar";
import { contributionRingStatus } from "./activePoolDerivations";
import type { ActivePoolContributionEntry } from "@/lib/api";

interface ContributionStatusCardProps {
  entries: ActivePoolContributionEntry[];
  contributedCount: number;
  totalMembers: number;
}

export function ContributionStatusCard({ entries, contributedCount, totalMembers }: ContributionStatusCardProps) {
  return (
    <div className="bg-sb-surface border border-sb-line rounded-[24px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-sb-ink uppercase tracking-wide">Contributions Status</h3>
        <span className="text-xs text-sb-ink-2 font-medium">
          <span className="font-bold text-sb-brand-600 dark:text-sb-brand-400">{contributedCount}</span> of {totalMembers} paid
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-sb-ink-2">No contribution data for this cycle yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3 mb-4">
          {entries.map((e) => (
            <MemberAvatar key={`${e.cycleNumber}-${e.user.id}`} user={e.user} status={contributionRingStatus(e)} size="md" />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 pt-3 border-t border-sb-line">
        <LegendDot colorClassName="bg-sb-brand-500" label="Paid" />
        <LegendDot colorClassName="bg-amber-500" label="Pending" />
        <LegendDot colorClassName="bg-red-500" label="Overdue" />
      </div>
    </div>
  );
}

function LegendDot({ colorClassName, label }: { colorClassName: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full", colorClassName)} />
      <span className="text-[10px] text-sb-ink-2 font-medium">{label}</span>
    </div>
  );
}
