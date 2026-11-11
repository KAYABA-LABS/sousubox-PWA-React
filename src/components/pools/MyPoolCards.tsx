import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ds";
import type { ActivePoolListItem, JoinedPoolListItem } from "@/lib/api";
import { daysUntil, formatGHS, formatShortDate, humanizeEnum } from "@/lib/format";

/** Badge for an active pool from its contribution status and due date. */
export function activeStatus(pool: ActivePoolListItem): { tone: BadgeTone; label: string } {
  const status = pool.contributionStatus?.toUpperCase();
  if (status === "PENDING") {
    const days = daysUntil(pool.nextContributionDue);
    if (days !== null && days < 0) return { tone: "danger", label: "Overdue" };
    if (days !== null && days <= 3) return { tone: "warning", label: "Due soon" };
    return { tone: "warning", label: "Payment due" };
  }
  return { tone: "success", label: "Active" };
}

const cardClass =
  "flex flex-col gap-5 rounded-sb-card border border-sb-line bg-sb-surface p-5 shadow-sb-card transition-shadow hover:shadow-sb-pop focus-visible:outline-2 focus-visible:outline-sb-brand-500 sm:p-6";

/** Shared top row: name, terms and status badge. */
function CardTop({ name, terms, tone, label }: { name: string; terms: string; tone: BadgeTone; label: string }) {
  return (
    <span className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block truncate text-[17px] font-semibold text-sb-ink">{name}</span>
        <span className="mt-0.5 block text-[14px] text-sb-ink-2">{terms}</span>
      </span>
      <Badge tone={tone} dot>
        {label}
      </Badge>
    </span>
  );
}

/** A pool the user is contributing to now. */
export function ActivePoolCard({ pool }: { pool: ActivePoolListItem }) {
  const status = activeStatus(pool);
  const due = formatShortDate(pool.nextContributionDue);
  return (
    <Link href={`/pools/${pool.id}?type=active`} className={cardClass}>
      <CardTop name={pool.template.name} terms={`${formatGHS(pool.contributionAmount, true)} per cycle`} tone={status.tone} label={status.label} />
      <span className="flex items-end justify-between gap-3">
        <span className="text-[14px] text-sb-ink-2">
          Cycle <span className="font-semibold text-sb-ink">{pool.currentCycle}</span> of {pool.totalCycles}
        </span>
        <span className="text-right">
          <span className="block text-[12px] text-sb-ink-2">Next contribution</span>
          <span className="block text-[15px] font-semibold text-sb-ink">{due ?? "—"}</span>
        </span>
      </span>
    </Link>
  );
}

/** A pool the user has joined that hasn't started yet. */
export function JoinedPoolCard({ pool }: { pool: JoinedPoolListItem }) {
  const max = pool.template?.maxMembers ?? pool.currentMemberCount + pool.spotsRemaining;
  return (
    <Link href={`/pools/${pool.id}?type=joined`} className={cardClass}>
      <CardTop
        name={pool.template.name}
        terms={`${formatGHS(pool.contributionAmount, true)} · ${humanizeEnum(pool.frequency)}`}
        tone="info"
        label="Upcoming"
      />
      <span className="flex items-end justify-between gap-3">
        <span className="text-[14px] text-sb-ink-2">
          <span className="font-semibold text-sb-ink">{pool.currentMemberCount}</span> / {max} members
        </span>
        <span className="text-right">
          <span className="block text-[12px] text-sb-ink-2">Payout</span>
          <span className="block text-[15px] font-semibold text-sb-ink">{formatGHS(pool.payoutAmount, true)}</span>
        </span>
      </span>
    </Link>
  );
}
