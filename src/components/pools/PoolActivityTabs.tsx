"use client";

import { CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memberName } from "@/lib/pool-format";
import { MemberAvatar } from "./MemberAvatar";
import { contributionRingStatus, type CompletedCycleGroup } from "./activePoolDerivations";
import type { ActivePoolPayoutEntry } from "@/lib/api";

interface PoolActivityTabsProps {
  completedCycles: CompletedCycleGroup[];
  payouts: ActivePoolPayoutEntry[];
}

const TAB_TRIGGER_CLASS =
  "flex-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-none";

export function PoolActivityTabs({ completedCycles, payouts }: PoolActivityTabsProps) {
  return (
    <div className="bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20">
      <Tabs defaultValue="contributions">
        <TabsList className="w-full h-auto bg-[#FBF6EF] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1 gap-1">
          <TabsTrigger value="contributions" className={TAB_TRIGGER_CLASS}>
            Contribution Timeline
          </TabsTrigger>
          <TabsTrigger value="payouts" className={TAB_TRIGGER_CLASS}>
            Payout Timeline
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contributions" className="mt-4">
          <ContributionTimelineTab groups={completedCycles} />
        </TabsContent>
        <TabsContent value="payouts" className="mt-4">
          <PayoutTimelineTab payouts={payouts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContributionTimelineTab({ groups }: { groups: CompletedCycleGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No completed cycles yet.</p>;
  }
  const mostRecentCycle = String(groups[groups.length - 1].cycleNumber);
  return (
    <Accordion type="single" collapsible defaultValue={mostRecentCycle}>
      {groups.map((g) => {
        const paidCount = g.entries.filter((e) => e.completed).length;
        const missedCount = g.entries.length - paidCount;
        return (
          <AccordionItem
            key={g.cycleNumber}
            value={String(g.cycleNumber)}
            className="border-b border-black/[0.04] dark:border-white/10 last:border-0 "
          >
            <AccordionTrigger className="py-4  pl-4 pr-2 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="text-xs font-bold text-[#0C0F14] dark:text-white">Cycle {g.cycleNumber}</span>
                <span className="text-[11px] font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">{paidCount} paid</span>
                  <span className="text-gray-300 dark:text-gray-600 mx-1.5">·</span>
                  <span className="text-red-600 dark:text-red-400">{missedCount} missed</span>
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 pl-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {g.entries.map((e) => (
                  <MemberAvatar key={`${g.cycleNumber}-${e.user.id}`} user={e.user} status={contributionRingStatus(e)} size="sm" />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function PayoutTimelineTab({ payouts }: { payouts: ActivePoolPayoutEntry[] }) {
  if (payouts.length === 0) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No payout schedule available yet.</p>;
  }
  return (
    <div className="space-y-2">
      {payouts.map((entry) => {
        const name = memberName(entry.user) || "To be determined";
        return (
          <div key={entry.cycleNumber} className="flex items-center gap-3 py-2 border-b border-black/[0.04] dark:border-white/10 last:border-0">
            <span className="w-6 h-6 rounded-full bg-[#FBF6EF] dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
              {entry.cycleNumber}
            </span>
            <MemberAvatar user={entry.user} size="sm" muted={entry.projected} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0C0F14] dark:text-white truncate">{name}</p>
              {entry.projected && <p className="text-[10px] text-gray-500 dark:text-gray-400">Projected</p>}
            </div>
            <span className="text-sm font-bold text-[#0C0F14] dark:text-white shrink-0">GHS {entry.amount}</span>
            {entry.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">Upcoming</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
