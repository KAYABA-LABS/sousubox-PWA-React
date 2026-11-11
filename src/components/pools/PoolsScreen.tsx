"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Plus, UsersRound } from "lucide-react";
import { Card, ChipGroup, EmptyNote, PageHeading, SectionHeader, Skeleton, TextLink, buttonClass } from "@/components/ds";
import { AppShell } from "@/components/shell/AppShell";
import { PoolDetailModal } from "@/components/PoolDetailModal";
import { ActivePoolCard, JoinedPoolCard } from "./MyPoolCards";
import { PoolFeatureCard } from "./PoolFeatureCard";
import { PoolsRail } from "./PoolsRail";
import { usePoolsData } from "./usePoolsData";

type Tab = "mine" | "discover";

/** Grid of skeleton cards while a list loads. */
function GridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[136px] rounded-sb-card" />
      ))}
    </div>
  );
}

/** Pools screen: the user's pools, discoverable pools and what's due. */
export function PoolsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const pools = usePoolsData();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "discover" ? "discover" : "mine");
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const deepLinkedPool = params.get("pool");
  const openedDeepLink = useRef(false);

  // Open the pool a Home card linked to (?pool=<id>) once discover data arrives.
  useEffect(() => {
    if (!deepLinkedPool || openedDeepLink.current || !pools.discover) return;
    const match = pools.discover.find((p) => p.id === deepLinkedPool);
    if (match) {
      openedDeepLink.current = true;
      pools.openDetail(match);
    }
  }, [deepLinkedPool, pools.discover, pools]);

  /** Switch tabs and keep the URL shareable. */
  const changeTab = (next: Tab) => {
    setTab(next);
    router.replace(next === "discover" ? "/pools?tab=discover" : "/pools", { scroll: false });
  };

  const byName = (name: string) => !query || name.toLowerCase().includes(query);
  const active = (pools.active ?? []).filter((p) => byName(p.template.name));
  const joined = (pools.joined ?? []).filter((p) => byName(p.template.name));
  const discover = (pools.discover ?? []).filter((p) => byName(p.template?.name ?? ""));
  const mineLoading = pools.active === null || pools.joined === null;

  return (
    <AppShell rail={<PoolsRail active={pools.active} />}>
      <PageHeading
        eyebrow="Pools"
        title="Save together, win together."
        action={
          <button type="button" onClick={() => changeTab("discover")} className={buttonClass("primary", "lg")}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
            Join a pool
          </button>
        }
      />
      <ChipGroup
        label="Pool lists"
        value={tab}
        onChange={changeTab}
        options={[
          { value: "mine", label: "My pools" },
          { value: "discover", label: "Discover" },
        ]}
      />
      {query && (
        <p className="text-[14px] text-sb-ink-2">
          Showing pools matching “{params.get("q")}”.{" "}
          <TextLink href={tab === "discover" ? "/pools?tab=discover" : "/pools"} className="text-[14px]">
            Clear search
          </TextLink>
        </p>
      )}

      {tab === "mine" ? (
        <>
          <section className="flex flex-col gap-4">
            <SectionHeader icon={UsersRound} title="My pools" />
            {mineLoading ? (
              <GridSkeleton />
            ) : active.length + joined.length === 0 ? (
              <Card>
                <EmptyNote>You haven&apos;t joined a pool yet. Discover one below to start saving with others.</EmptyNote>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((pool) => (
                  <ActivePoolCard key={pool.id} pool={pool} />
                ))}
                {joined.map((pool) => (
                  <JoinedPoolCard key={pool.id} pool={pool} />
                ))}
              </div>
            )}
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Compass} title="Popular to join" action={<TextLink href="/pools?tab=discover">Discover</TextLink>} />
            {pools.discover === null ? (
              <GridSkeleton />
            ) : discover.length === 0 ? (
              <Card>
                <EmptyNote>No pools are open to join right now. New circles appear here as they launch.</EmptyNote>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {discover.slice(0, 2).map((pool, i) => (
                  <PoolFeatureCard key={pool.id} pool={pool} emblem={i === 0 ? "people" : "crown"} onSelect={pools.openDetail} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-4">
          <SectionHeader icon={Compass} title="Open pools" />
          {pools.discover === null ? (
            <GridSkeleton />
          ) : discover.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {discover.map((pool, i) => (
                <PoolFeatureCard key={pool.id} pool={pool} emblem={i % 2 ? "crown" : "people"} onSelect={pools.openDetail} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyNote>{query ? "No pools match your search." : "No pools are open right now. Check back soon."}</EmptyNote>
            </Card>
          )}
        </section>
      )}

      {pools.detail && (
        <PoolDetailModal
          listItem={pools.detail.listItem}
          details={pools.detail.details}
          isLoadingDetails={pools.detail.isLoading}
          detailsError={pools.detail.error}
          isOpen
          onClose={pools.closeDetail}
          onJoin={async (poolId) => {
            if (await pools.join(poolId)) changeTab("mine");
          }}
          isJoining={pools.joiningId === pools.detail.listItem.id}
        />
      )}
    </AppShell>
  );
}
