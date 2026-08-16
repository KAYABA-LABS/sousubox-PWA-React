"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { usePoolStore } from "@/stores/usePoolStore";
import { usePoolService } from "@/services/poolService";
import { Users, Search, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";

export default function PoolsPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const poolService = usePoolService();
  const { userPools, setUserPools, isLoading, setLoading } = usePoolStore();
  const [searchQuery, setSearchQuery] = useState("");

  const loadPools = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const pools = await poolService.getUserPools(userId);
      setUserPools(pools);
    } catch {
      toast.error("Failed to load pools");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadPools();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const filteredPools = userPools.filter((m) =>
    (m.pool.template.name as string).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] flex flex-col pb-32 font-sans">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-emerald-950/45 tracking-widest uppercase font-semibold">Your finances</p>
            <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">My Pools</h1>
          </div>
          <button
            onClick={() => router.push("/pools/discover")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-full transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Discover
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-950/30" />
          <input
            type="text"
            placeholder="Search active circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-white border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-sm font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors shadow-[0_2px_8px_rgba(20,60,40,0.04)]"
          />
        </div>
      </motion.header>

      <main className="flex-1 px-5 max-w-xl mx-auto w-full">
        {filteredPools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-emerald-950/[0.04] rounded-[28px] p-6 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
              <Users className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-bold text-emerald-950 mb-1">No active pools yet</h2>
            <p className="text-xs text-emerald-950/50 mb-6 max-w-[220px] leading-relaxed">
              Join a collaborative rotating Susu pool to start saving with your community.
            </p>
            <button
              onClick={() => router.push("/pools/discover")}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-full transition-all"
            >
              Find a pool
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPools.map((membership, index) => {
              const pool = membership.pool;
              const percent = Math.min(
                Math.round((pool.currentCycle / pool.totalCycles) * 100),
                100
              );
              const isActive = pool.status === "ACTIVE" || pool.status === "Active";

              return (
                <motion.div
                  key={membership.membershipId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/pools/${pool.id}`)}
                  className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 cursor-pointer hover:border-emerald-700/20 transition-all active:scale-[0.99] shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-emerald-950 mb-1 truncate">
                        {pool.template.name}
                      </h3>
                      <p className="text-[10px] text-emerald-950/40 uppercase tracking-wider font-semibold mb-3">
                        {pool.template.tier} Tier &middot; {pool.frequency}
                      </p>

                      <div className="flex items-center gap-2.5 text-[11px] text-emerald-950/55 flex-wrap">
                        <span className="font-bold text-emerald-950">
                          GHS {pool.contributionAmount}
                          <span className="font-normal text-emerald-950/40">
                            /{pool.frequency === "WEEKLY" ? "wk" : "mo"}
                          </span>
                        </span>
                        <span className="text-emerald-950/15">&bull;</span>
                        <span>
                          Cycle {pool.currentCycle}/{pool.totalCycles}
                        </span>
                        <span className="text-emerald-950/15">&bull;</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {pool.currentMemberCount}/{pool.maxMembers}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {pool.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-emerald-950/25" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-950/[0.06] space-y-2">
                    <div className="flex justify-between text-[10px] text-emerald-950/50 font-semibold">
                      <span>Contributed: GHS {membership.totalContributed}</span>
                      <span>Payout: GHS {pool.payoutAmount}</span>
                    </div>

                    <div className="h-1.5 bg-[#FBF6EF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Dock activeItem="pools" onItemClick={(href) => router.push(href)} />
    </main>
  );
}
