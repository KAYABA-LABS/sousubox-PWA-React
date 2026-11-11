import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, BarChart3, ChevronRight, Download, PiggyBank, PlusCircle, ShieldAlert, UsersRound, type LucideIcon } from "lucide-react";
import { Card, EmptyNote, IconTile, LinkButton, SectionHeader, Skeleton, TextLink } from "@/components/ds";
import { PoolFeatureCard } from "@/components/pools/PoolFeatureCard";
import { SAVINGS_PRODUCTS, newPlanHref } from "@/lib/plans";
import { greetingForNow } from "@/lib/format";
import { BalanceCard } from "./BalanceCard";
import type { HomeData } from "./useHomeData";

const QUICK_ACTIONS: { title: string; subtitle: string; href: string; icon: LucideIcon }[] = [
  { title: "Join a Pool", subtitle: "Find a susu group", href: "/pools?tab=discover", icon: PlusCircle },
  { title: "Start Saving", subtitle: "Grow your money", href: newPlanHref(), icon: PiggyBank },
  { title: "Send Money", subtitle: "To friends & family", href: "/transfer", icon: ArrowLeftRight },
  { title: "Deposit", subtitle: "Fund your wallet", href: "/deposit", icon: Download },
];

/** Compact action tile: icon, title, subtitle and chevron. */
function ActionTile({ title, subtitle, href, icon }: (typeof QUICK_ACTIONS)[number]) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-sb-card border border-sb-line bg-sb-surface p-3 shadow-sb-card transition-shadow hover:shadow-sb-pop focus-visible:outline-2 focus-visible:outline-sb-brand-500"
    >
      <IconTile icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-sb-ink">{title}</span>
        <span className="block truncate text-[12px] text-sb-ink-2">{subtitle}</span>
      </span>
      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-sb-ink-3" />
    </Link>
  );
}

/** Prompt shown until the user's identity is verified. */
function KycPrompt() {
  return (
    <Card className="flex flex-col gap-4 border-sb-amber/25 sm:flex-row sm:items-center">
      <IconTile icon={ShieldAlert} tone="amber" size="lg" />
      <div className="flex-1">
        <p className="text-[15px] font-semibold text-sb-ink">Verify your identity to unlock pools and transfers</p>
        <p className="mt-1 text-[14px] text-sb-ink-2">It takes about two minutes with your Ghana Card.</p>
      </div>
      <LinkButton href="/kyc" size="sm" trailingArrow className="self-start sm:self-auto">
        Verify now
      </LinkButton>
    </Card>
  );
}

/** Main column of the Home screen. */
export function HomeMain({ data }: { data: HomeData }) {
  const firstName = data.profile?.firstName;
  return (
    <>
      <section className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-sb-brand-600">
            {greetingForNow()}
            {firstName ? `, ${firstName}` : ""} <span aria-hidden="true">👋</span>
          </p>
          <h1 className="mt-2 text-[2.125rem] leading-[1.04] font-bold tracking-[-0.04em] text-sb-ink sm:text-[3.25rem]">
            Your money,
            <br />
            beautifully <span className="text-sb-brand-600">organized.</span>
          </h1>
          <p className="mt-3 text-[17px] text-sb-ink-2">Save, grow and achieve more with sousubox.</p>
          <LinkButton href="/pools?tab=discover" size="md" trailingArrow className="mt-5">
            Explore your options
          </LinkButton>
        </div>
        <Image
          src="/images/wallet-art.jpg"
          alt=""
          width={324}
          height={264}
          priority
          className="hidden w-[220px] shrink-0 mix-blend-multiply md:block lg:w-[240px] dark:hidden"
        />
      </section>

      {!data.isLoading && data.kycStatus !== "VERIFIED" && <KycPrompt />}

      <BalanceCard account={data.account} isLoading={data.isLoading} />

      <nav aria-label="Quick actions" className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <ActionTile key={action.title} {...action} />
        ))}
      </nav>

      <section className="flex flex-col gap-4">
        <SectionHeader icon={UsersRound} title="Popular Pools" action={<TextLink href="/pools?tab=discover">See all</TextLink>} />
        {data.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[120px] rounded-sb-card" />
            <Skeleton className="h-[120px] rounded-sb-card" />
          </div>
        ) : data.popularPools.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.popularPools.map((pool, i) => (
              <PoolFeatureCard key={pool.id} pool={pool} emblem={i === 0 ? "photo" : "crown"} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyNote>No open pools right now. New circles appear here as they launch.</EmptyNote>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader icon={BarChart3} title="Your Savings" action={<TextLink href="/plans">See all</TextLink>} />
        <div className="grid gap-3 sm:grid-cols-3">
          {SAVINGS_PRODUCTS.slice(0, 3).map((product) => (
            <ActionTile
              key={product.planId}
              title={product.name}
              subtitle={product.tagline}
              href={newPlanHref(product.planId)}
              icon={product.icon}
            />
          ))}
        </div>
      </section>
    </>
  );
}
