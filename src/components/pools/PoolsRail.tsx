import { AlarmClock, CalendarCheck, CalendarDays } from "lucide-react";
import { Card, CardHeader, EmptyNote, HeroCard, IconTile, LinkButton, SegmentedProgress, Skeleton } from "@/components/ds";
import type { ActivePoolListItem } from "@/lib/api";
import { daysUntil, describeDue, formatGHS, formatShortDate } from "@/lib/format";

/** Active pools still owing this cycle's contribution, soonest first. */
export function duePools(active: ActivePoolListItem[]) {
  return active
    .filter((p) => p.contributionStatus?.toUpperCase() === "PENDING")
    .sort((a, b) => (daysUntil(a.nextContributionDue) ?? 9999) - (daysUntil(b.nextContributionDue) ?? 9999));
}

/** Rail for the Pools screen: next contribution and everything due. */
export function PoolsRail({ active }: { active: ActivePoolListItem[] | null }) {
  if (active === null) {
    return (
      <>
        <Skeleton className="h-[220px] rounded-sb-hero" />
        <Skeleton className="h-[260px] rounded-sb-card" />
      </>
    );
  }
  const due = duePools(active);
  const next = due[0];

  return (
    <>
      {next ? (
        <HeroCard icon={CalendarCheck} eyebrow="Your next contribution" title={formatGHS(next.contributionAmount)}>
          <p>
            {next.template.name} is due {describeDue(daysUntil(next.nextContributionDue)) ?? "soon"}. Cycle {next.currentCycle} of{" "}
            {next.totalCycles}.
          </p>
          <div className="mt-4">
            <SegmentedProgress
              filled={next.currentCycle}
              total={next.totalCycles}
              label={`Cycle ${next.currentCycle} of ${next.totalCycles}`}
            />
          </div>
        </HeroCard>
      ) : (
        <HeroCard icon={CalendarCheck} eyebrow="Contributions" title="You're all caught up">
          Nothing is due right now. We&apos;ll remind you before your next cycle.
        </HeroCard>
      )}

      <Card>
        <CardHeader icon={CalendarDays} title="Due now" />
        <ul className="mt-4 flex flex-col">
          {due.length === 0 && <EmptyNote>No contributions due.</EmptyNote>}
          {due.slice(0, 4).map((pool) => {
            const days = daysUntil(pool.nextContributionDue);
            const urgent = days !== null && days <= 3;
            return (
              <li key={pool.id} className="flex items-center gap-4 py-3">
                <IconTile icon={urgent ? AlarmClock : CalendarDays} tone={urgent ? "amber" : "brand"} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-sb-ink">{pool.template.name}</span>
                  <span className="block text-[13px] text-sb-ink-2">Due {formatShortDate(pool.nextContributionDue) ?? "soon"}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-semibold text-sb-ink tabular">{formatGHS(pool.contributionAmount)}</span>
                  <span className="block text-[12px] text-sb-ink-3">{describeDue(days)}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {next && (
          <LinkButton href={`/pools/${next.id}/contribute`} size="lg" className="mt-4 w-full">
            Pay {formatGHS(next.contributionAmount)} now
          </LinkButton>
        )}
      </Card>
    </>
  );
}
