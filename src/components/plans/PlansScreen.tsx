"use client";

import { useState } from "react";
import { CalendarClock, Plus, Repeat } from "lucide-react";
import { Card, CardHeader, ChipGroup, EmptyNote, IconTile, LinkButton, PageHeading, ProTipCard, Skeleton, TextLink } from "@/components/ds";
import { AppShell } from "@/components/shell/AppShell";
import type { SavingsGoal } from "@/lib/api";
import { describeDue, formatGHS } from "@/lib/format";
import { INVEST_ENABLED } from "@/lib/features";
import { SAVINGS_PRODUCTS, newPlanHref, productForType } from "@/lib/plans";
import { ComingSoon } from "./ComingSoon";
import { PlanCard } from "./PlanCard";
import { usePlansData, type PlansData } from "./usePlansData";

type Filter = "all" | "flexible" | "locked" | "goals" | "auto" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All plans" },
  { value: "flexible", label: "Flexible" },
  { value: "locked", label: "Locked" },
  { value: "goals", label: "Goals" },
  { value: "auto", label: "Auto save" },
  { value: "completed", label: "Completed" },
];

/** Whether a plan belongs under the selected filter pill. */
function matchesFilter(goal: SavingsGoal, filter: Filter) {
  switch (filter) {
    case "flexible":
      return goal.type === "FLEXIBLE_SAVINGS";
    case "locked":
      return goal.type === "TIMELOCK_VAULT";
    case "goals":
      return goal.type === "TARGET_FUND";
    case "auto":
      return goal.type === "AUTOSAVE";
    case "completed":
      return goal.status === "COMPLETED";
    default:
      return true;
  }
}

/** One figure in the dark summary banner. */
function SummaryStat({ value, label, divided }: { value: string; label: string; divided?: boolean }) {
  return (
    <div className={divided ? "sm:border-l sm:border-white/15 sm:pl-6" : undefined}>
      <p className="text-[26px] leading-none font-bold tracking-[-0.02em] tabular sm:text-[30px]">{value}</p>
      <p className="mt-2 text-[13px] text-white/75">{label}</p>
    </div>
  );
}

/** Dark banner: total saved, active plans, next contribution and "New plan". */
function PlansSummary({ data }: { data: PlansData }) {
  const next = data.upcoming[0];
  return (
    <section className="flex flex-col gap-6 rounded-sb-hero bg-sb-hero p-6 text-white shadow-sb-pop sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-6 sm:grid-cols-3 sm:gap-6">
        <SummaryStat value={formatGHS(data.totalSaved)} label={`Total saved · ${data.goals.length} plans`} />
        <SummaryStat value={String(data.activeCount)} label="Active plans" divided />
        <SummaryStat
          value={next ? (describeDue(next.dueDays) ?? "—") : "—"}
          label={next ? `Next save · ${next.name || productForType(next.type).name}` : "No saves scheduled"}
          divided
        />
      </div>
      <LinkButton href={newPlanHref()} variant="light" icon={Plus} className="self-start lg:self-auto">
        New plan
      </LinkButton>
    </section>
  );
}

/** Right rail list of the next scheduled contributions. */
function UpcomingSaves({ data }: { data: PlansData }) {
  return (
    <Card>
      <CardHeader icon={Repeat} title="Upcoming saves" action={<TextLink href="/invest/plans">Manage</TextLink>} />
      <ul className="mt-4 flex flex-col">
        {data.isLoading && [0, 1].map((i) => <Skeleton key={i} className="my-3 h-11" />)}
        {!data.isLoading && data.upcoming.length === 0 && <EmptyNote>No contributions scheduled.</EmptyNote>}
        {data.upcoming.map((goal) => (
          <li key={goal.id} className="flex items-center gap-4 py-3">
            <IconTile icon={CalendarClock} tone="blue" size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold text-sb-ink">{goal.name || productForType(goal.type).name}</span>
              <span className="block text-[13px] text-sb-ink-2">{productForType(goal.type).name}</span>
            </span>
            <span className="text-right text-[13px] font-semibold text-sb-ink">{describeDue(goal.dueDays)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Plans screen: summary, filters and the grid of the user's savings plans. */
export function PlansScreen() {
  const data = usePlansData(INVEST_ENABLED);
  const [filter, setFilter] = useState<Filter>("all");
  const visible = data.goals.filter((goal) => matchesFilter(goal, filter));
  const rates = SAVINGS_PRODUCTS.map((p) => p.ratePct);
  const extra = Math.max(...rates) - Math.min(...rates);

  if (!INVEST_ENABLED) {
    return (
      <AppShell>
        <ComingSoon eyebrow="Savings plans" />
      </AppShell>
    );
  }

  return (
    <AppShell
      rail={
        <>
          <UpcomingSaves data={data} />
          <ProTipCard href="/invest" cta="Compare plans">
            Locked plans earn up to {extra}% more than Flex Save.
          </ProTipCard>
        </>
      }
    >
      <PageHeading eyebrow="Savings plans" title="Grow at your own pace." />
      <PlansSummary data={data} />
      <ChipGroup label="Filter plans" options={FILTERS} value={filter} onChange={setFilter} />
      {data.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[170px] rounded-sb-card" />
          ))}
        </div>
      ) : data.error ? (
        <Card>
          <EmptyNote>We couldn&apos;t load your plans. Check your connection and try again.</EmptyNote>
        </Card>
      ) : visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visible.map((goal) => (
            <PlanCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-[15px] text-sb-ink-2">
            {filter === "all" ? "You don't have any savings plans yet." : "No plans match this filter."}
          </p>
          <LinkButton href={newPlanHref()} icon={Plus} size="sm">
            Start a plan
          </LinkButton>
        </Card>
      )}
    </AppShell>
  );
}
