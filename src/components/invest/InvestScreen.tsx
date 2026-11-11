"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Sprout, Trophy } from "lucide-react";
import { Card, CardHeader, EmptyNote, HeroCard, IconTile, LinkButton, PageHeading, ProgressBar, SectionHeader, Skeleton, TextLink } from "@/components/ds";
import { AppShell } from "@/components/shell/AppShell";
import { usePlansData, type PlansData } from "@/components/plans/usePlansData";
import { formatGHS } from "@/lib/format";
import { SAVINGS_PRODUCTS, newPlanHref, productForType } from "@/lib/plans";
import { cn } from "@/lib/utils";

const BASICS = [
  { title: "How interest is calculated", minutes: 3 },
  { title: "Flex vs Fixed: which is right?", minutes: 4 },
  { title: "Is my money safe?", minutes: 2 },
];

/** Bar per plan sized by balance; the largest plan is highlighted. */
function BalanceBars({ data }: { data: PlansData }) {
  const plans = data.goals.filter((g) => Number(g.balance) > 0).slice(0, 12);
  const max = Math.max(1, ...plans.map((g) => Number(g.balance)));
  const top = plans.find((g) => Number(g.balance) === max)?.id;
  if (!plans.length) return <EmptyNote>Your plans will appear here once you start saving.</EmptyNote>;
  return (
    <ul className="flex h-[190px] items-end gap-2 sm:gap-3" aria-label="Balance by plan">
      {plans.map((goal) => {
        const name = goal.name || productForType(goal.type).name;
        const highlight = goal.id === top;
        return (
          <li key={goal.id} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
            <span
              title={`${name}: ${formatGHS(goal.balance)}`}
              className={cn(
                "block w-full rounded-lg",
                highlight ? "bg-gradient-to-b from-sb-brand-400 to-sb-brand-700" : "bg-sb-tint-2"
              )}
              style={{ height: `${Math.max(8, (Number(goal.balance) / max) * 100)}%` }}
            />
            <span className={cn("truncate text-center text-[11px]", highlight ? "font-semibold text-sb-ink" : "text-sb-ink-2")}>{name}</span>
            <span className="sr-only">{formatGHS(goal.balance)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Rail card tracking the plan closest to its target. */
function TopGoalCard({ data }: { data: PlansData }) {
  const goal = data.goals
    .filter((g) => Number(g.target) > 0 && g.status === "ACTIVE")
    .sort((a, b) => b.balance / b.target - a.balance / a.target)[0];
  if (!goal) {
    return (
      <HeroCard
        icon={Trophy}
        eyebrow="Savings goal"
        title="Set your first target"
        action={<LinkButton href={newPlanHref("target")} variant="light" size="lg" trailingArrow className="w-full">Start a goal</LinkButton>}
      >
        Goal Booster nudges you every week until you get there.
      </HeroCard>
    );
  }
  const name = goal.name || productForType(goal.type).name;
  return (
    <HeroCard
      icon={Trophy}
      eyebrow="Closest to target"
      title={name}
      action={<LinkButton href={`/invest/plan/${goal.id}`} variant="light" size="lg" trailingArrow className="w-full">Add to this plan</LinkButton>}
    >
      <p>
        {formatGHS(goal.balance, true)} of {formatGHS(goal.target, true)} saved.
      </p>
      <ProgressBar value={goal.balance} max={goal.target} label={`${name} progress`} onHero className="mt-4" />
    </HeroCard>
  );
}

/** Invest screen: total growing, ways to grow and learning links. */
export function InvestScreen() {
  const data = usePlansData();
  return (
    <AppShell
      rail={
        <>
          <TopGoalCard data={data} />
          <Card>
            <CardHeader icon={BookOpen} title="Learn the basics" />
            <ul className="mt-4">
              {BASICS.map((item) => (
                <li key={item.title}>
                  <Link href="/learn-more" className="flex items-center justify-between gap-3 border-t border-sb-line py-3.5 hover:bg-sb-surface-2/60 focus-visible:outline-2 focus-visible:outline-sb-brand-500">
                    <span>
                      <span className="block text-[15px] font-semibold text-sb-ink">{item.title}</span>
                      <span className="block text-[13px] text-sb-ink-2">{item.minutes} min read</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 text-sb-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      }
    >
      <PageHeading eyebrow="Invest" title="A place to grow your money." subtitle="Earn steady interest on what you save. No jargon, no surprises." />

      <Card className="p-6 sm:p-7">
        <p className="text-[14px] text-sb-ink-2">Total growing</p>
        {data.isLoading ? (
          <Skeleton className="mt-2 h-10 w-56" />
        ) : (
          <p className="mt-1 text-sb-amount font-bold text-sb-ink tabular">{formatGHS(data.totalSaved)}</p>
        )}
        <p className="mt-1 text-[13px] text-sb-ink-3">Across {data.goals.length} plan{data.goals.length === 1 ? "" : "s"}</p>
        <div className="mt-6">{data.isLoading ? <Skeleton className="h-[190px]" /> : <BalanceBars data={data} />}</div>
      </Card>

      <section className="flex flex-col gap-4">
        <SectionHeader icon={Sprout} title="Ways to grow" action={<TextLink href="/invest/opportunities">Compare</TextLink>} />
        <div className="grid gap-4 md:grid-cols-2">
          {SAVINGS_PRODUCTS.map((product) => (
            <Link
              key={product.planId}
              href={newPlanHref(product.planId)}
              className="flex items-center gap-4 rounded-sb-card border border-sb-line bg-sb-surface p-5 shadow-sb-card transition-shadow hover:shadow-sb-pop focus-visible:outline-2 focus-visible:outline-sb-brand-500"
            >
              <IconTile icon={product.icon} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold text-sb-ink">{product.name}</span>
                <span className="block text-[14px] text-sb-ink-2">{product.description}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[22px] font-bold text-sb-brand-600 tabular">{product.ratePct}%</span>
                <span className="block text-[12px] text-sb-ink-2">per year</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
