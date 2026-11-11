import Link from "next/link";
import { ArrowUp, History, TrendingUp, Zap } from "lucide-react";
import { Card, CardHeader, EmptyNote, HeroCard, IconTile, LinkButton, ProTipCard, Skeleton, TextLink } from "@/components/ds";
import { formatSignedGHS } from "@/lib/format";
import { newPlanHref } from "@/lib/plans";
import type { HomeData } from "./useHomeData";

/** Recent pool contributions, newest first. */
function RecentActivity({ data }: { data: HomeData }) {
  return (
    <Card>
      <CardHeader icon={History} title="Recent Activity" action={<TextLink href="/activity">See all</TextLink>} />
      <ul className="mt-4 flex flex-col">
        {data.isLoading &&
          [0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-9 flex-1" />
            </li>
          ))}
        {!data.isLoading && data.recent.length === 0 && <EmptyNote>Your contributions will show up here.</EmptyNote>}
        {data.recent.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/pools/${entry.poolId}?type=active`}
              className="flex items-center gap-4 rounded-xl py-3 hover:bg-sb-surface-2/60 focus-visible:outline-2 focus-visible:outline-sb-brand-500"
            >
              <IconTile icon={ArrowUp} tone={entry.completed ? "brand" : "amber"} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-sb-ink">Pool contribution</span>
                <span className="block truncate text-[13px] text-sb-ink-2">{entry.poolName}</span>
              </span>
              <span className="text-right">
                <span className="block text-[15px] font-semibold text-sb-ink tabular">{formatSignedGHS(entry.amount, "out")}</span>
                <span className="block text-[12px] text-sb-ink-3">
                  Cycle {entry.cycleNumber} · {entry.completed ? "Paid" : "Pending"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Right rail of the Home screen. */
export function HomeRail({ data }: { data: HomeData }) {
  return (
    <>
      <HeroCard
        icon={Zap}
        eyebrow="Quick Actions"
        title="Ready to save more?"
        corner={
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sb-brand-300">
            <TrendingUp className="size-4" strokeWidth={1.75} />
          </span>
        }
        action={
          <LinkButton href={newPlanHref()} variant="light" size="lg" trailingArrow className="w-full">
            Create Plan
          </LinkButton>
        }
      >
        Start a new savings plan today and build a better future.
      </HeroCard>
      <RecentActivity data={data} />
      <ProTipCard href={`${newPlanHref("auto")}`} cta="Set it up" tall>
        Set up auto-save to grow your savings effortlessly.
      </ProTipCard>
    </>
  );
}
