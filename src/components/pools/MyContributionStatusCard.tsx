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
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
          : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          paid
            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
        )}
      >
        {paid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white">{paid ? "Paid" : "Pending Contribution"}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {paid
            ? `Your cycle ${currentCycle} contribution of GHS ${myContribution.amount} was processed successfully.`
            : `Your cycle ${currentCycle} contribution of GHS ${myContribution.amount} is pending, make a deposit to process your contribution.`}
        </p>
      </div>
    </div>
  );
}
