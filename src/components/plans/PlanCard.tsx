import Link from "next/link";
import { IconTile, ProgressBar } from "@/components/ds";
import type { SavingsGoal } from "@/lib/api";
import { describeDue, formatGHS, humanizeEnum } from "@/lib/format";
import { productForType } from "@/lib/plans";

/** Subtitle under a plan name: status or next contribution. */
function planSubtitle(goal: SavingsGoal) {
  if (goal.status === "COMPLETED") return "Completed";
  if (goal.status !== "ACTIVE") return humanizeEnum(goal.status);
  const due = describeDue(goal.dueDays);
  return due ? `Next save ${due}` : productForType(goal.type).name;
}

/** Savings plan tile: product, rate, balance against target and progress. */
export function PlanCard({ goal }: { goal: SavingsGoal }) {
  const product = productForType(goal.type);
  const hasTarget = Number(goal.target) > 0;
  return (
    <Link
      href={`/invest/plan/${goal.id}`}
      className="flex flex-col rounded-sb-card border border-sb-line bg-sb-surface p-5 shadow-sb-card transition-shadow hover:shadow-sb-pop focus-visible:outline-2 focus-visible:outline-sb-brand-500"
    >
      <span className="flex items-start gap-3">
        <IconTile icon={product.icon} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold text-sb-ink">{goal.name || product.name}</span>
          <span className="block truncate text-[12px] text-sb-ink-2">{planSubtitle(goal)}</span>
        </span>
        <span className="shrink-0 pt-0.5 text-[13px] font-semibold text-sb-brand-600">{product.ratePct}% p.a.</span>
      </span>
      <span className="mt-5 block text-[24px] leading-none font-bold tracking-[-0.02em] text-sb-ink tabular">
        {formatGHS(goal.balance, true)}
      </span>
      <span className="mt-1.5 block text-[13px] text-sb-ink-2">{hasTarget ? `of ${formatGHS(goal.target, true)}` : "No target set"}</span>
      <ProgressBar
        value={Number(goal.balance)}
        max={hasTarget ? Number(goal.target) : 0}
        label={`${goal.name || product.name} progress`}
        className="mt-4"
      />
    </Link>
  );
}
