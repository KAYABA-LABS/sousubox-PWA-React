"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useRefetchOnFocus } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { formatGhs } from "@/lib/pool-format";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratorEarnings } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { PoolStatusChip } from "@/components/group-pools/PoolStatusChip";
import { GPCard, GPPageHeader } from "@/components/group-pools/ui";

export default function ModeratorEarningsPage() {
  const router = useRouter();
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();
  useModeratorAreaStatus();
  const [earnings, setEarnings] = useState<ModeratorEarnings | null>(null);

  const reload = useCallback(() => {
    if (!ready) return;
    service.getEarnings(userId).then(setEarnings, (err) => {
      toast.error(resolveGroupPoolError(err).message);
      setEarnings((prev) => prev ?? { totalFeeShare: 0, totalBondLocked: 0, totalOwedToMe: 0, pools: [] });
    });
  }, [ready, service, userId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload, ready);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader eyebrow="Pool Moderator" title="Earnings" onBack={() => router.push("/moderator")} />
      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {earnings === null ? (
          <>
            <Skeleton className="h-24 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-32 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Fee share earned" value={formatGhs(earnings.totalFeeShare)} gold />
              <Stat label="Guarantees locked" value={formatGhs(earnings.totalBondLocked)} />
              <Stat label="Owed to you" value={formatGhs(earnings.totalOwedToMe)} />
            </div>

            {earnings.pools.length === 0 ? (
              <GPCard className="flex flex-col items-center text-center py-12">
                <Coins className="w-7 h-7 text-gray-400 mb-2" strokeWidth={1.75} />
                <p className="text-sm font-bold text-[#0C0F14] dark:text-white">No earnings yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
                  You earn a share of the management fee once your pools start paying out.
                </p>
              </GPCard>
            ) : (
              <GPCard className="p-0 overflow-hidden">
                <ul className="divide-y divide-black/[0.05] dark:divide-white/5">
                  {earnings.pools.map((pool) => (
                    <li key={pool.poolId}>
                      <button
                        onClick={() => router.push(`/moderator/pools/${pool.poolId}`)}
                        className="w-full text-left px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{pool.name}</p>
                          <PoolStatusChip status={pool.status} className="shrink-0" />
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <Row label="Fee share" value={formatGhs(pool.feeShare)} />
                          <Row label="Owed to you" value={formatGhs(pool.owedToMe)} />
                          {pool.bond && (
                            <>
                              <Row label="Guarantee left" value={formatGhs(pool.bond.remaining)} />
                              <Row label="Used · repaid" value={`${formatGhs(pool.bond.drawnTotal)} · ${formatGhs(pool.bond.repaidTotal)}`} />
                            </>
                          )}
                        </dl>
                      </button>
                    </li>
                  ))}
                </ul>
              </GPCard>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 border ${
        gold
          ? "bg-[#D4A843]/10 dark:bg-[#D4A843]/15 border-[#D4A843]/25"
          : "bg-white dark:bg-[#151A1F] border-black/[0.04] dark:border-white/10"
      }`}
    >
      <p className={`text-[9px] font-semibold uppercase tracking-wider ${gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-bold break-words ${gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-[#0C0F14] dark:text-white"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-semibold text-[#0C0F14] dark:text-white text-right">{value}</dd>
    </div>
  );
}
