"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyContributionStatusCardProps {
  myContribution: { amount: number; isEarly: boolean; status: string; paidThisCycle: boolean };
  currentCycle: number;
}

export function MyContributionStatusCard({ myContribution, currentCycle }: MyContributionStatusCardProps) {
  const paid = myContribution.paidThisCycle;

  return (
    <div
      className={cn(
        "rounded-[24px] p-5 border flex items-start gap-3",
        paid
          ? "bg-sb-tint dark:bg-sb-brand-500/10 border-sb-tint-2 dark:border-sb-brand-500/20"
          : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          paid
            ? "bg-sb-tint dark:bg-sb-brand-500/20 text-sb-brand-700 dark:text-sb-brand-400"
            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
        )}
      >
        {paid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      </div>
      <div>
        <h3 className="text-sm font-bold text-sb-ink">{paid ? "Paid" : "Pending Contribution"}</h3>
        <p className="text-xs text-sb-ink-2 mt-1 leading-relaxed">
          {paid
            ? `Your cycle ${currentCycle} contribution of GHS ${myContribution.amount} was processed successfully.`
            : `Your cycle ${currentCycle} contribution of GHS ${myContribution.amount} is pending, make a deposit to process your contribution.`}
        </p>
      </div>
    </div>
  );
}
