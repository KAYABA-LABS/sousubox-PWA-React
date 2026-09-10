"use client";

import { motion } from "framer-motion";
import { ProgressRing } from "@/components/ui/progress-ring";

interface PoolCycleHeroCardProps {
  tier: string;
  cyclePot: { currency: string; amount: number };
  contributionAmount: number | null;
  currentCycle: number;
  totalCycles: number;
  daysLeftInCycle: number | null;
}

export function PoolCycleHeroCard({
  tier,
  cyclePot,
  contributionAmount,
  currentCycle,
  totalCycles,
  daysLeftInCycle,
}: PoolCycleHeroCardProps) {
  const ratio = totalCycles > 0 ? Math.min(currentCycle / totalCycles, 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[28px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12),0_16px_40px_rgba(0,0,0,0.10)] dark:shadow-black/40"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D4F3C] to-[#156B53] z-0" />
      <div className="absolute right-[-40px] top-[-40px] w-[180px] h-[180px] rounded-full bg-white/5 z-0" />
      <svg className="absolute left-[-20px] bottom-[-40px] w-[160px] h-[160px] opacity-[0.10] text-white z-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.7" />
      </svg>
      <div className="relative z-10 p-6 flex flex-col gap-5">
        <span className="self-start inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-widest text-white">
          {tier} Tier
        </span>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {contributionAmount !== null && (
              <div>
                <p className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">Contribution</p>
                <p className="text-lg font-bold text-[#D4A843] mt-0.5 truncate">
                  {cyclePot.currency} {contributionAmount.toLocaleString()}
                </p>
              </div>
            )}
            <div className={contributionAmount !== null ? "mt-3 pt-3 border-t border-white/15" : undefined}>
              <p className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">This cycle&apos;s pot</p>
              <p className="text-xl font-bold text-[#D4A843] mt-0.5 truncate">
                {cyclePot.currency} {cyclePot.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <ProgressRing value={ratio} size={112} stroke={9} trackClassName="text-white/15" progressClassName="text-[#D4A843]" className="shrink-0">
            <div className="text-center">
              <p className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">Cycle</p>
              <p className="text-xl font-bold text-white leading-none mt-1">
                {currentCycle}
                <span className="text-white/40 font-semibold">/{totalCycles}</span>
              </p>
              <p className="text-[10px] text-white/60 font-medium mt-1">
                {daysLeftInCycle === null ? "—" : `${daysLeftInCycle}d left`}
              </p>
            </div>
          </ProgressRing>
        </div>
      </div>
    </motion.div>
  );
}
