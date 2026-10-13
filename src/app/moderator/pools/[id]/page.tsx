"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useRefetchOnFocus } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratedPool } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolStatusChip } from "@/components/group-pools/PoolStatusChip";
import { OverviewTab } from "@/components/group-pools/manage/OverviewTab";
import { RequestsTab } from "@/components/group-pools/manage/RequestsTab";
import { MembersTab } from "@/components/group-pools/manage/MembersTab";
import { BondTab } from "@/components/group-pools/manage/BondTab";
import { GPCard, GPFullPageLoader, GPFullPageMessage, GPPageHeader } from "@/components/group-pools/ui";

type ManageTab = "overview" | "requests" | "members" | "bond";

const TAB_LABELS: Record<ManageTab, string> = { overview: "Overview", requests: "Requests", members: "Members", bond: "Bond" };

/** Requests only matter while forming; the bond can only be topped up while running. */
function tabsFor(status: ModeratedPool["status"]): ManageTab[] {
  if (status === "FORMING") return ["overview", "requests", "members"];
  if (status === "ACTIVE" || status === "PAUSED") return ["overview", "members", "bond"];
  return ["overview", "members"];
}

const TAB_CLASS =
  "flex-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-none";

export default function ManagePoolPage() {
  return (
    <Suspense fallback={<GPFullPageLoader />}>
      <ManagePoolContent />
    </Suspense>
  );
}

function ManagePoolContent() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();
  // Entering the moderator area counts as activity.
  useModeratorAreaStatus();

  const [tab, setTab] = useState<ManageTab>(() => {
    const requested = searchParams.get("tab");
    return requested && requested in TAB_LABELS ? (requested as ManageTab) : "overview";
  });
  const [pool, setPool] = useState<ModeratedPool | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!ready) return;
    service.getModeratedPools(userId).then(
      (pools) => setPool(pools.find((p) => p.id === poolId) ?? null),
      (err) => {
        const error = resolveGroupPoolError(err);
        setLoadError(error.message);
        if (error.treatment !== "page") toast.error(error.message);
      }
    );
  }, [ready, service, userId, poolId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload, ready);

  if (pool === undefined && !loadError) return <GPFullPageLoader />;
  if (!pool) {
    return (
      <GPFullPageMessage
        title="Pool Not Found"
        message={loadError ?? "This pool doesn't exist or you don't moderate it."}
        actionLabel="Back to my pools"
        onAction={() => router.push("/moderator")}
      />
    );
  }

  const forming = pool.status === "FORMING";
  const tabs = tabsFor(pool.status);
  const activeTab = tabs.includes(tab) ? tab : "overview";

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader
        eyebrow="Manage pool"
        title={pool.name}
        onBack={() => router.push("/moderator")}
        right={<PoolStatusChip status={pool.status} className="shrink-0" />}
      />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {created && (
          <GPCard className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-start gap-3">
              <PartyPopper className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0C0F14] dark:text-white">Your pool is ready</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Share the invite code below. You&apos;ll approve each request before anyone joins.
                </p>
              </div>
            </div>
          </GPCard>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setTab(value as ManageTab)}>
          <TabsList className="w-full h-auto bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 rounded-full p-1 gap-1 justify-between">
            {tabs.map((value) => (
              <TabsTrigger key={value} value={value} className={TAB_CLASS}>
                {TAB_LABELS[value]}
                {value === "requests" && pool.pendingRequestCount > 0 && (
                  <span className="ml-1 inline-flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px]">
                    {pool.pendingRequestCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activeTab === "overview" && <OverviewTab pool={pool} userId={userId} onChanged={reload} />}
        {activeTab === "requests" && <RequestsTab poolId={pool.id} userId={userId} canReview={forming} onChanged={reload} />}
        {activeTab === "members" && <MembersTab poolId={pool.id} userId={userId} canRemove={forming} onChanged={reload} />}
        {activeTab === "bond" && <BondTab pool={pool} userId={userId} onChanged={reload} />}
      </div>
    </main>
  );
}
