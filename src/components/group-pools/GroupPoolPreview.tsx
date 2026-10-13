"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  FileText,
  HandCoins,
  Info,
  LifeBuoy,
  Percent,
  Receipt,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { formatGhs, formatRate, memberName } from "@/lib/pool-format";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { GroupPoolPreview as GroupPoolPreviewData, PayoutOrderType } from "@/lib/api";
import { ModeratorCard } from "./ModeratorCard";
import { GPCard, GPChip } from "./ui";

const ORDER_LABELS: Record<PayoutOrderType, string> = {
  RANDOM: "Random draw",
  SENIORITY: "Order of joining",
  MANUAL: "Set by the moderator",
};

const ORDER_EXPLANATIONS: Record<PayoutOrderType, string> = {
  RANDOM: "The payout order is drawn at random when the pool starts.",
  SENIORITY: "Members are paid in the order they joined.",
  MANUAL: "The moderator sets the payout order. You'll be asked to accept it before joining.",
};

export function ManualOrderList({ order, myUserId }: { order: GroupPoolPreviewData["manualOrder"]; myUserId?: string }) {
  if (order.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">The moderator hasn&apos;t set the order yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {[...order]
        .sort((a, b) => a.position - b.position)
        .map(({ position, user }) => (
          <li
            key={`${position}-${user.id}`}
            className="flex items-center gap-3 rounded-xl bg-[#FBF6EF] dark:bg-white/5 px-3 py-2"
          >
            <span className="w-6 text-center text-xs font-bold text-gray-500 dark:text-gray-400">{position}</span>
            <MemberAvatar user={user} size="xs" />
            <span className="text-sm font-medium text-[#0C0F14] dark:text-white truncate">
              {memberName(user)}
              {myUserId && user.id === myUserId ? " (you)" : ""}
            </span>
          </li>
        ))}
    </ol>
  );
}

export function GroupPoolPreview({ pool, myUserId }: { pool: GroupPoolPreviewData; myUserId?: string }) {
  const [tab, setTab] = useState("info");

  const rows: [React.ElementType, string, string][] = [
    [Repeat, "Contribution", `${formatGhs(pool.contributionAmount)} daily`],
    [CalendarDays, "Payout", pool.payoutFrequencyLabel || `Every ${pool.payoutIntervalDays} days`],
    [HandCoins, "Each payout", formatGhs(pool.payoutAmount)],
    [Wallet, "Join amount", formatGhs(pool.joinAmount)],
    [ShieldCheck, "Security reserve", formatGhs(pool.securityReserve)],
    [Receipt, "Joining fee", formatGhs(pool.joiningFee)],
    [Percent, "Management fee", formatRate(pool.managementFeePercent)],
    [Clock, "Late fee", formatRate(pool.latePenaltyRate)],
    [LifeBuoy, "Lifelines", String(pool.contributionLifelines)],
    [RefreshCw, "Cycles", String(pool.totalCycles)],
    [Users, "Payout order", ORDER_LABELS[pool.payoutOrderType] ?? pool.payoutOrderType],
  ];

  return (
    <div className="space-y-4">
      <GPCard>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GPChip tone="primary">Group</GPChip>
              {pool.status !== "FORMING" && <GPChip tone="amber">{pool.status}</GPChip>}
            </div>
            <h2 className="text-lg font-bold text-[#0C0F14] dark:text-white">{pool.name}</h2>
          </div>
          <GPChip tone={pool.spotsRemaining > 0 ? "emerald" : "red"} className="shrink-0 text-[10px]">
            {pool.spotsRemaining > 0 ? `${pool.spotsRemaining} spots left` : "Full"}
          </GPChip>
        </div>
        {pool.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{pool.description}</p>
        )}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Daily" value={formatGhs(pool.contributionAmount)} />
          <Stat label="Payout" value={formatGhs(pool.payoutAmount)} gold />
          <Stat label="Members" value={`${pool.currentMemberCount}/${pool.maxMembers}`} />
        </div>
        <ModeratorCard moderator={pool.moderator} />
      </GPCard>

      <GPCard className="p-0 overflow-hidden">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mx-5 mt-5 flex h-auto gap-1 rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-500/10">
            {([
              { value: "info", label: "Info", icon: Info },
              { value: "members", label: "Members", icon: Users },
              { value: "rules", label: "Rules", icon: FileText },
            ] as const).map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-emerald-800/70 shadow-none dark:text-emerald-200/60 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-md dark:data-[state=active]:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-5">
            <TabsContent value="info" className="mt-0 space-y-4">
              <div className="divide-y divide-black/[0.05] dark:divide-white/5">
                {rows.map(([Icon, label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2.5 gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {label}
                    </span>
                    <span className="text-sm font-medium text-[#0C0F14] dark:text-white text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#0D4F3C]/5 dark:bg-[#156B53]/10 border border-[#0D4F3C]/10 dark:border-[#156B53]/20 p-3">
                <p className="text-xs font-bold text-[#0D4F3C] dark:text-emerald-300 mb-0.5">Moderator&apos;s guarantee</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {formatGhs(pool.bond.amount)} is locked to cover missed payments · covers {pool.bond.coveragePercent}% of the
                  pool&apos;s {formatGhs(pool.bond.totalPoolValue)}.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-0 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {pool.currentMemberCount} of {pool.maxMembers} spots filled
              </p>
              {pool.payoutOrderType === "MANUAL" ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0C0F14] dark:text-white mb-2">Payout order</p>
                  <ManualOrderList order={pool.manualOrder} myUserId={myUserId} />
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Member names are shown to the group once you join.
                </p>
              )}
            </TabsContent>

            <TabsContent value="rules" className="mt-0 space-y-3">
              {pool.rulesText && (
                <div className="rounded-xl bg-gray-100 dark:bg-white/5 p-4">
                  <p className="text-xs font-bold text-[#0C0F14] dark:text-white mb-1">From the moderator</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{pool.rulesText}</p>
                </div>
              )}
              <div className="rounded-xl bg-gray-100 dark:bg-white/5 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {ORDER_EXPLANATIONS[pool.payoutOrderType] ?? ""}
                </p>
              </div>
              <div className="rounded-xl bg-gray-100 dark:bg-white/5 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {groupPoolCopy.lifelinesTooltip(formatRate(pool.latePenaltyRate), pool.contributionLifelines)}
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </GPCard>
    </div>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div
      className={
        gold
          ? "bg-[#D4A843]/10 dark:bg-[#D4A843]/15 rounded-xl p-2.5 text-center"
          : "bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-center"
      }
    >
      <p
        className={`text-[9px] font-semibold uppercase tracking-wider mb-0.5 ${
          gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {label}
      </p>
      <p className={`text-xs font-bold ${gold ? "text-[#B58A28] dark:text-[#E2BB5C]" : "text-[#0C0F14] dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}
