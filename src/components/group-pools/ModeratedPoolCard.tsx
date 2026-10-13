"use client";

import { motion } from "framer-motion";
import { CalendarClock, ChevronRight, Inbox, Users } from "lucide-react";
import { formatDate, formatGhs } from "@/lib/pool-format";
import type { ModeratedPool } from "@/lib/api";
import { BondHealthBar } from "./BondHealthBar";
import { PoolStatusChip } from "./PoolStatusChip";
import { GPCard } from "./ui";

export function ModeratedPoolCard({ pool, index = 0, onOpen }: { pool: ModeratedPool; index?: number; onOpen: () => void }) {
  const forming = pool.status === "FORMING";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <GPCard
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        className="cursor-pointer hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-all active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{pool.name}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {formatGhs(pool.contributionAmount)} daily · every {pool.payoutIntervalDays}{" "}
              {pool.payoutIntervalDays === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pool.pendingRequestCount > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold"
                aria-label={`${pool.pendingRequestCount} pending requests`}
              >
                <Inbox className="w-3 h-3" /> {pool.pendingRequestCount}
              </span>
            )}
            <PoolStatusChip status={pool.status} />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {pool.currentMemberCount}/{pool.maxMembers}
          </span>
          {forming && pool.formingDeadline && (
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" /> Fill by {formatDate(pool.formingDeadline)}
            </span>
          )}
          {!forming && pool.totalCycles > 0 && (
            <span>
              Cycle {pool.currentCycle}/{pool.totalCycles}
            </span>
          )}
          {forming && pool.inviteCode && <span className="font-mono tracking-wider">{pool.inviteCode}</span>}
        </div>

        {pool.bond && (
          <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
            <BondHealthBar bond={pool.bond} poolStatus={pool.status} compact />
          </div>
        )}
      </GPCard>
    </motion.div>
  );
}
