"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatGhs } from "@/lib/pool-format";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { PoolTransparency } from "@/lib/api";
import { GPCard, GPSectionTitle } from "./ui";

type Debt = PoolTransparency["debts"][number];

/** "Ama K. · GH₵120.00 still to repay · 4 days missed · GH₵40.00 repaid" (plan decision 17). */
export function debtLine(debt: Pick<Debt, "amountOwed" | "daysMissed" | "amountRepaid">) {
  return `${formatGhs(debt.amountOwed)} still to repay · ${debt.daysMissed} ${debt.daysMissed === 1 ? "day" : "days"} missed · ${formatGhs(debt.amountRepaid)} repaid`;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

interface GroupHealthCardProps {
  transparency: PoolTransparency;
  onRepay?: () => void;
}

/** Always-visible transparency card: guarantee coverage and who owes the pool (plan decision 15). */
export function GroupHealthCard({ transparency, onRepay }: GroupHealthCardProps) {
  const { bond, uncovered, debts } = transparency;
  const remainingRatio = bond.total > 0 ? Math.min(1, Math.max(0, bond.remaining / bond.total)) : 0;
  const owing = debts.filter((d) => d.amountOwed > 0);
  const sorted = [...owing].sort((a, b) => Number(b.isMe) - Number(a.isMe));

  return (
    <GPCard>
      <GPSectionTitle>Group health</GPSectionTitle>

      <p className="text-sm text-[#0C0F14] dark:text-white">
        {groupPoolCopy.bondMember(bond.remaining, bond.total, bond.coveragePercent)}
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "h-full rounded-full",
            bond.status === "DEPLETED" ? "bg-red-500" : remainingRatio > 0.5 ? "bg-emerald-500" : remainingRatio >= 0.2 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${Math.round(remainingRatio * 100)}%` }}
        />
      </div>

      {uncovered.days > 0 && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          {uncovered.days} {uncovered.days === 1 ? "day" : "days"} ({formatGhs(uncovered.amount)}) not yet covered
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Repayments owed to the pool
        </p>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nobody owes the pool anything.</p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((debt, index) => (
              <li
                key={`${debt.name}-${index}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5",
                  debt.isMe
                    ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                    : "bg-[#FBF6EF] dark:bg-white/5"
                )}
              >
                <Avatar className="w-8 h-8 text-[10px]">
                  {debt.photoUrl && <AvatarImage src={debt.photoUrl} alt={debt.name} />}
                  <AvatarFallback className="bg-[#0D4F3C]/10 dark:bg-[#156B53]/15 text-[#0D4F3C] dark:text-[#156B53] font-bold">
                    {initials(debt.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C0F14] dark:text-white truncate">
                    {debt.isMe ? "You" : debt.name}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">{debtLine(debt)}</p>
                </div>
                {debt.isMe && onRepay && (
                  <button
                    onClick={onRepay}
                    className="shrink-0 px-4 py-1.5 rounded-full bg-[#0D4F3C] hover:bg-[#156B53] text-white text-xs font-bold"
                  >
                    Repay
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {sorted.some((d) => d.isMe) && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
            {groupPoolCopy.ownDebt(sorted.find((d) => d.isMe)?.amountOwed ?? 0)}
          </p>
        )}
      </div>
    </GPCard>
  );
}

export function PausedBanner({ pauseReason }: { pauseReason: string | null }) {
  return (
    <div role="status" className="rounded-[24px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5">
      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Payouts are paused</p>
      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
        {pauseReason ? `${pauseReason.replace(/\.$/, "")}. ` : ""}
        The pool&apos;s guarantee has run out, so payouts are on hold until the moderator tops it up or members repay what
        they owe. Keep contributing daily. Held payouts are paid in order once the pool resumes.
      </p>
    </div>
  );
}
