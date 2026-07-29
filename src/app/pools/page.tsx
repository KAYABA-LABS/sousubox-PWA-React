"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { usePoolStore } from "@/stores/usePoolStore";
import { usePoolService } from "@/services/poolService";
import { Users, Search, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E660]" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#0C0F14] text-white flex flex-col pb-32 relative overflow-hidden font-sans">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4 z-10 max-w-xl mx-auto w-full"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">Your Finances</p>
            <h1 className="text-2xl font-black text-white tracking-tight">My Pools</h1>
          </div>
          <Button
            onClick={() => router.push("/pools/discover")}
            className="px-4 py-2 bg-gradient-to-r from-[#00E660] to-[#00B84D] hover:opacity-90 active:scale-95 text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/10"
          >
            <Sparkles className="w-4.5 h-4.5 mr-1" />
            Discover Pools
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search active circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#161A24] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </motion.header>

      <main className="flex-1 px-5 z-10 max-w-xl mx-auto w-full">
        {filteredPools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#161A24]/40 border border-white/5 rounded-3xl p-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">No active pools yet</h2>
            <p className="text-xs text-gray-400 mb-6 max-w-[200px] leading-relaxed">
              Join a collaborative rotating Susu pool to start saving with your community.
            </p>
            <Button
              onClick={() => router.push("/pools/discover")}
              className="px-6 py-2.5 bg-white hover:bg-white/90 text-black font-black text-xs rounded-xl transition-all shadow-lg"
            >
              Find a Pool
            </Button>
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
                >
                  <Card className="bg-[#161A24] border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/10 transition-all active:scale-[0.99] group relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#00E660] to-[#00B84D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors truncate">
                          {pool.template.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">
                          {pool.template.tier} Tier • {pool.frequency}
                        </p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="font-extrabold text-white">
                            GHS {pool.contributionAmount}
                            <span className="font-normal text-gray-500">
                              /{pool.frequency === "WEEKLY" ? "wk" : "mo"}
                            </span>
                          </span>
                          <span className="text-white/10">•</span>
                          <span>
                            Cycle {pool.currentCycle}/{pool.totalCycles}
                          </span>
                          <span className="text-white/10">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {pool.currentMemberCount}/{pool.maxMembers}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                        <Badge
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase border ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }`}
                        >
                          {pool.status}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                        <span>Contributed: GHS {membership.totalContributed}</span>
                        <span>Payout: GHS {pool.payoutAmount}</span>
                      </div>
                      
                      {/* Custom linear progress track */}
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00E660] to-[#00B84D] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </Card>
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
