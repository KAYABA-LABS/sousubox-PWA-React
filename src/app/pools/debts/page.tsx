"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useRefetchOnFocus } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { api, type GroupDebt, type MyGroupDebts } from "@/lib/api";
import { track } from "@/lib/analytics";
import { formatGhs } from "@/lib/pool-format";
import { depositHref } from "@/lib/safeRedirect";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  GP_DRAWER_CLASS,
  GPCard,
  GPChip,
  GPPageHeader,
  GPPrimaryButton,
  GPSecondaryButton,
} from "@/components/group-pools/ui";

/** `poolId` undefined = repay all, oldest first. */
type RepayTarget = { poolId?: string; label: string; outstanding: number };

export default function MyGroupDebtsPage() {
  const router = useRouter();
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();

  const [debts, setDebts] = useState<MyGroupDebts | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [target, setTarget] = useState<RepayTarget | null>(null);
  const [repaying, setRepaying] = useState(false);

  const reload = useCallback(() => {
    if (!ready) return;
    Promise.all([service.getMyDebts(userId), api.getUserCheckingAccount(userId).catch(() => null)]).then(
      ([result, account]) => {
        setDebts(result);
        if (account?.success && account.checkingAccount) setAvailableBalance(account.checkingAccount.availableBalance);
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setDebts((prev) => prev ?? { totalOutstanding: 0, debts: [] });
      }
    );
  }, [ready, service, userId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload, ready);

  const repay = async () => {
    if (!target) return;
    setRepaying(true);
    try {
      const result = await service.repayDebt(userId, target.poolId);
      track("group_debt_repaid", { poolId: target.poolId ?? "all" });
      toast.success(
        result.remainingOutstanding > 0
          ? `Repaid ${formatGhs(result.repaid)}. ${formatGhs(result.remainingOutstanding)} still to repay.`
          : `Repaid ${formatGhs(result.repaid)}. You're all clear.`
      );
      setTarget(null);
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.code === "INSUFFICIENT_FUNDS") {
        setTarget(null);
        router.push(depositHref(target.outstanding, "/pools/debts"));
      } else {
        toast.error(error.message);
      }
    }
    setRepaying(false);
    reload();
  };

  const active = (debts?.debts ?? []).filter((d) => d.outstanding > 0);
  const total = debts?.totalOutstanding ?? 0;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader eyebrow="Group pools" title="My group debt" onBack={() => router.back()} />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-3">
        {debts === null ? (
          <>
            <Skeleton className="h-36 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-24 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />
          </>
        ) : total <= 0 ? (
          <GPCard className="flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <PartyPopper className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-1">You don&apos;t owe any group</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed">
              Missed days covered by a moderator&apos;s guarantee would show up here.
            </p>
          </GPCard>
        ) : (
          <>
            <GPCard>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Still to repay</p>
              <p className="text-3xl font-bold text-[#0C0F14] dark:text-white mt-1">{formatGhs(total)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Repaying lets you join new pools and keeps payouts flowing. Deposits also repay it automatically, oldest
                first.
              </p>
              {availableBalance !== null && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available balance: {formatGhs(availableBalance)}</p>
              )}
              <GPPrimaryButton
                className="mt-4"
                onClick={() => setTarget({ label: "all your group debt", outstanding: total })}
              >
                Repay
              </GPPrimaryButton>
            </GPCard>

            {active.map((debt) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                onRepay={() => setTarget({ poolId: debt.poolId, label: debt.pool.name, outstanding: debt.outstanding })}
              />
            ))}
          </>
        )}
      </div>

      <Drawer open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DrawerContent className={GP_DRAWER_CLASS}>
          {target && (
            <div className="px-5 pb-8">
              <DrawerHeader className="px-0 text-left">
                <DrawerTitle className="text-[#0C0F14] dark:text-white">Repay {target.label}</DrawerTitle>
                <DrawerDescription className="text-gray-500 dark:text-gray-400">
                  {availableBalance !== null && availableBalance < target.outstanding
                    ? `We'll use your available balance (${formatGhs(availableBalance)}) towards the ${formatGhs(target.outstanding)} you owe.`
                    : `We'll pay ${formatGhs(target.outstanding)} from your available balance.`}
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-2 pt-2">
                {availableBalance !== null && availableBalance <= 0 ? (
                  <GPPrimaryButton onClick={() => router.push(depositHref(target.outstanding, "/pools/debts"))}>
                    Add funds
                  </GPPrimaryButton>
                ) : (
                  <GPPrimaryButton loading={repaying} onClick={repay}>
                    Repay now
                  </GPPrimaryButton>
                )}
                <GPSecondaryButton disabled={repaying} onClick={() => setTarget(null)}>
                  Cancel
                </GPSecondaryButton>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </main>
  );
}

function DebtRow({ debt, onRepay }: { debt: GroupDebt; onRepay: () => void }) {
  const ended = debt.pool.status === "COMPLETED" || debt.pool.status === "CANCELLED";
  return (
    <GPCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{debt.pool.name}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {formatGhs(debt.outstanding)} still to repay · {debt.daysMissed} {debt.daysMissed === 1 ? "day" : "days"} missed ·{" "}
            {formatGhs(debt.repaid)} repaid
          </p>
        </div>
        <GPChip tone={ended ? "gray" : debt.pool.status === "PAUSED" ? "amber" : "primary"} className="shrink-0">
          {ended ? "Ended" : debt.pool.status}
        </GPChip>
      </div>
      <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          <HandCoins className="w-3.5 h-3.5" />
          Owed to {debt.creditor === "BOND" ? "the pool's guarantee" : "the moderator"}
        </span>
        <button
          onClick={onRepay}
          className="px-4 py-1.5 rounded-full bg-[#0D4F3C] hover:bg-[#156B53] text-white text-xs font-bold"
        >
          Repay
        </button>
      </div>
    </GPCard>
  );
}
