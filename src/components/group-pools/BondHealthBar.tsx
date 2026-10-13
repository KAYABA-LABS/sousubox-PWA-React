"use client";

import { cn } from "@/lib/utils";
import { bondHealth } from "@/lib/groupPoolBond";
import { formatGhs } from "@/lib/pool-format";
import type { GroupPoolBond, GroupPoolStatus } from "@/lib/api";

const BAR = { emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" } as const;
const TEXT = {
  emerald: "text-emerald-700 dark:text-emerald-400",
  amber: "text-amber-700 dark:text-amber-400",
  red: "text-red-700 dark:text-red-400",
} as const;

export function BondHealthBar({ bond, poolStatus, compact }: { bond: GroupPoolBond; poolStatus?: GroupPoolStatus | string; compact?: boolean }) {
  const health = bondHealth(bond, poolStatus);
  const percent = Math.round(health.coverage * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-gray-500 dark:text-gray-400">Guarantee</span>
        <span className={TEXT[health.tone]}>
          {health.needsTopUp ? "Top up to resume" : `${formatGhs(bond.remaining)} left · ${percent}%`}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden"
        role="meter"
        aria-label="Guarantee remaining"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={cn("h-full rounded-full transition-all", BAR[health.tone])} style={{ width: `${percent}%` }} />
      </div>
      {!compact && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {formatGhs(bond.initialAmount + bond.toppedUpTotal)} locked · {formatGhs(bond.drawnTotal)} used ·{" "}
          {formatGhs(bond.repaidTotal)} repaid
        </p>
      )}
    </div>
  );
}
