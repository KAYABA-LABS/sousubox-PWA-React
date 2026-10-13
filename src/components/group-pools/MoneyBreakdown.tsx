"use client";

import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { GroupPoolPreview } from "@/lib/api";

type MoneyFields = Pick<
  GroupPoolPreview,
  "joinAmount" | "securityReserve" | "joiningFee" | "contributionAmount" | "payoutIntervalDays" | "payoutAmount"
>;

export function MoneyBreakdown({ pool }: { pool: MoneyFields }) {
  const copy = groupPoolCopy.money;
  return (
    <div className="rounded-2xl bg-[#FBF6EF] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      <p className="font-semibold text-[#0C0F14] dark:text-white">{copy.summary(pool.joinAmount)}</p>
      <ul className="space-y-1 pl-4 list-disc marker:text-gray-400">
        <li>{copy.reserve(pool.securityReserve)}</li>
        <li>{copy.fee(pool.joiningFee)}</li>
      </ul>
      <p>{copy.rhythm(pool.contributionAmount, pool.payoutIntervalDays, pool.payoutAmount)}</p>
    </div>
  );
}
