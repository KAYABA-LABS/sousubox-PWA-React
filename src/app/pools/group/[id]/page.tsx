"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Info, Settings2, Users } from "lucide-react";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useRefetchOnFocus, useVisiblePolling } from "@/hooks/use-refetch";
import { usePoolService } from "@/services/poolService";
import { useGroupPoolService } from "@/services/groupPoolService";
import {
  api,
  ApiError,
  type ActivePoolDetails,
  type JoinedPoolDetails,
  type PoolDetailsResponse,
  type PoolTransparency,
} from "@/lib/api";
import { formatDate, formatGhs } from "@/lib/pool-format";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import { PoolCycleHeroCard } from "@/components/pools/PoolCycleHeroCard";
import { ContributionStatusCard } from "@/components/pools/ContributionStatusCard";
import { MyContributionStatusCard } from "@/components/pools/MyContributionStatusCard";
import { PoolActivityTabs } from "@/components/pools/PoolActivityTabs";
import {
  currentCycleMemberStatuses,
  groupCompletedCycles,
  payoutRows,
  payoutStatusMap,
} from "@/components/pools/activePoolDerivations";
import { GroupHealthCard, PausedBanner } from "@/components/group-pools/GroupHealthCard";
import { RepayDrawer, type RepayTarget } from "@/components/group-pools/RepayDrawer";
import { PoolStatusChip } from "@/components/group-pools/PoolStatusChip";
import {
  GPCard,
  GPChip,
  GPFullPageLoader,
  GPFullPageMessage,
  GPPageHeader,
  GPSectionTitle,
  GPStickyFooter,
} from "@/components/group-pools/ui";

type GroupPoolState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "forming"; joined: JoinedPoolDetails; details: PoolDetailsResponse | null }
  | { kind: "running"; active: ActivePoolDetails; details: PoolDetailsResponse | null; transparency: PoolTransparency | null };

const NOT_ACTIVE_CODES = new Set(["POOL_NOT_ACTIVE_YET", "POOL_NOT_ACTIVE"]);

export default function GroupPoolPage() {
  const router = useRouter();
  const poolId = useParams().id as string;
  const { userId, ready } = useDatabaseUserId();
  const poolService = usePoolService();
  const groupService = useGroupPoolService();

  const [state, setState] = useState<GroupPoolState>({ kind: "loading" });
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [repayTarget, setRepayTarget] = useState<RepayTarget | null>(null);

  const load = useCallback(async (): Promise<GroupPoolState> => {
    const details = await groupService.getPoolDetails(poolId).catch(() => null);
    try {
      const active = await poolService.getActivePoolDetails(userId, poolId);
      const transparency = await groupService.getTransparency(userId, poolId).catch((err) => {
        if (err instanceof ApiError && err.code === "NOT_A_MEMBER") throw err;
        return null;
      });
      return { kind: "running", active, details, transparency };
    } catch (err) {
      if (err instanceof ApiError && err.code && NOT_ACTIVE_CODES.has(err.code)) {
        const joined = await poolService.getJoinedPoolDetails(userId, poolId);
        return { kind: "forming", joined, details };
      }
      throw err;
    }
  }, [groupService, poolService, poolId, userId]);

  const reload = useCallback(() => {
    if (!ready) return;
    load().then(setState, (err) => setState({ kind: "error", message: resolveGroupPoolError(err).message }));
    api
      .getUserCheckingAccount(userId)
      .then((res) => res.success && res.checkingAccount && setAvailableBalance(res.checkingAccount.availableBalance))
      .catch(() => {});
  }, [ready, load, userId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload, ready);
  const paused = state.kind === "running" && (state.active.status === "PAUSED" || state.transparency?.status === "PAUSED");
  useVisiblePolling(reload, ready && paused);

  if (state.kind === "loading") return <GPFullPageLoader />;
  if (state.kind === "error") {
    return (
      <GPFullPageMessage
        title="Pool Not Found"
        message={state.message}
        actionLabel="Back to Pools"
        onAction={() => router.push("/pools")}
      />
    );
  }

  const isModerator = !!state.details?.moderatorId && state.details.moderatorId === userId;
  const manageButton = isModerator ? (
    <button
      onClick={() => router.push(`/moderator/pools/${poolId}`)}
      className="h-10 px-3 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0C0F14] dark:text-white shrink-0"
    >
      <Settings2 className="w-4 h-4" /> Manage
    </button>
  ) : null;

  if (state.kind === "forming") {
    return <FormingView joined={state.joined} details={state.details} right={manageButton} onBack={() => router.back()} />;
  }

  const { active, transparency } = state;
  const myDebt = transparency?.debts.find((d) => d.isMe && d.amountOwed > 0);
  const pauseReason = active.pauseReason ?? transparency?.pauseReason ?? null;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-36 font-sans">
      <GPPageHeader
        eyebrow="Group pool"
        title={state.details?.name || active.nickname}
        onBack={() => router.back()}
        right={
          <div className="flex items-center gap-2">
            {manageButton}
            <PoolStatusChip status={paused ? "PAUSED" : "ACTIVE"} />
          </div>
        }
      />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {paused && <PausedBanner pauseReason={pauseReason} />}

        <PoolCycleHeroCard
          badge="Group"
          cyclePot={active.cyclePot}
          contributionAmount={active.myContribution?.amount ?? null}
          currentCycle={active.currentCycle}
          totalCycles={active.totalCycles}
          daysLeftInCycle={active.daysLeftInCycle}
        />

        <ContributionStatusCard
          entries={currentCycleMemberStatuses(active)}
          contributedCount={active.contributedCount}
          totalMembers={active.totalMembers}
        />

        {active.myContribution && (
          <MyContributionStatusCard myContribution={active.myContribution} currentCycle={active.currentCycle} />
        )}

        {transparency && (
          <GroupHealthCard
            transparency={transparency}
            onRepay={
              myDebt
                ? () => setRepayTarget({ poolId, label: "what you owe this pool", outstanding: myDebt.amountOwed })
                : undefined
            }
          />
        )}

        <PoolActivityTabs
          completedCycles={groupCompletedCycles(active)}
          payouts={payoutRows(active)}
          payoutStatuses={payoutStatusMap(transparency)}
        />
      </div>

      {active.myContribution && (
        <GPStickyFooter>
          {active.myContribution.paidThisCycle ? (
            <div className="flex items-center justify-center gap-2 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl">
              <CheckCircle2 className="w-5 h-5" /> Paid for this cycle
            </div>
          ) : (
            <button
              onClick={() => router.push(`/pools/${poolId}/contribute`)}
              className="w-full h-14 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-[0.99] text-white font-bold rounded-2xl transition-all"
            >
              Contribute {formatGhs(active.myContribution.amount)}
            </button>
          )}
        </GPStickyFooter>
      )}

      <RepayDrawer
        target={repayTarget}
        availableBalance={availableBalance}
        returnTo={`/pools/group/${poolId}`}
        onClose={() => setRepayTarget(null)}
        onRepaid={reload}
      />
    </main>
  );
}

function FormingView({
  joined,
  details,
  right,
  onBack,
}: {
  joined: JoinedPoolDetails;
  details: PoolDetailsResponse | null;
  right: React.ReactNode;
  onBack: () => void;
}) {
  const description = details?.description ?? joined.template.description;
  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-16 font-sans">
      <GPPageHeader
        eyebrow="Group pool"
        title={details?.name || joined.template.name}
        onBack={onBack}
        right={
          <div className="flex items-center gap-2">
            {right}
            <PoolStatusChip status="FORMING" />
          </div>
        }
      />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        <GPCard>
          <GPChip tone="primary" className="mb-2">
            Group
          </GPChip>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{description}</p>}
          <div className="grid grid-cols-3 gap-2">
            <Tile label="Daily" value={formatGhs(joined.contributionAmount)} />
            <Tile label="Payout" value={formatGhs(joined.payoutAmount)} gold />
            <Tile label="Cycles" value={String(joined.totalCycles)} />
          </div>
        </GPCard>

        <GPCard>
          <GPSectionTitle>Membership</GPSectionTitle>
          <Row label="Joined" value={formatDate(joined.joinedAt)} />
          <Row label="Status" value={joined.memberStatus} />
          {details?.securityReserve !== undefined && <Row label="Security reserve" value={formatGhs(details.securityReserve)} />}
          <Row label="Joining fee" value={formatGhs(details?.joiningFee ?? joined.template.joiningFee)} />
        </GPCard>

        <GPCard>
          <GPSectionTitle>Capacity</GPSectionTitle>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" /> {joined.currentMemberCount}/{joined.template.maxMembers} members
            </span>
            <GPChip tone="emerald" className="text-[10px]">
              {joined.spotsRemaining} spots left
            </GPChip>
          </div>
        </GPCard>

        {details?.rulesText && (
          <GPCard>
            <GPSectionTitle>Group rules</GPSectionTitle>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{details.rulesText}</p>
          </GPCard>
        )}

        <div className="rounded-[24px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 flex items-start gap-3">
          {joined.startDate ? (
            <CalendarDays className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-[#0C0F14] dark:text-white">
              {joined.startDate ? `Starts on ${formatDate(joined.startDate)}` : "Starts once the pool is full"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your first contribution is due once the pool starts. If it doesn&apos;t fill in time, everyone is refunded.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Tile({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${gold ? "bg-[#D4A843]/10 dark:bg-[#D4A843]/15" : "bg-[#FBF6EF] dark:bg-white/5"}`}>
      <p className={`text-[9px] font-semibold uppercase tracking-wider ${gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </p>
      <p className={`text-sm font-bold ${gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-[#0C0F14] dark:text-white"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-[#0C0F14] dark:text-white">{value}</span>
    </div>
  );
}
