"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { usePoolStore } from "@/stores/usePoolStore";
import { usePoolService } from "@/services/poolService";
import { PoolDetailModal } from "@/components/PoolDetailModal";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { DiscoverPool } from "@/lib/api";

export default function DiscoverPoolsPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const poolService = usePoolService();
  const { discoverPools, setDiscoverPools, isLoading, setLoading } = usePoolStore();
  const [selectedPool, setSelectedPool] = useState<DiscoverPool | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  const loadPools = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const pools = await poolService.getDiscoverPools(userId);
      setDiscoverPools(pools);
    } catch {
      toast.error("Failed to discover pools");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadPools();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const handleJoin = async (poolId: string) => {
    if (!userId) return;
    setJoining(poolId);
    try {
      await poolService.joinPool(userId, poolId);
      setDiscoverPools(discoverPools.filter((p) => p.id !== poolId));
      setSelectedPool(null);
      router.push("/pools");
    } catch {
      toast.error("Failed to join pool");
    }
    setJoining(null);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Discover Pools</h1>
        </div>
        <p className="text-sm text-gray-500">
          Find a pool that matches your savings goals
        </p>
      </motion.header>

      <main className="flex-1 px-5">
        {discoverPools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No pools available</h2>
            <p className="text-sm text-gray-500">
              Check back later for new pools to join
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {discoverPools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPool(pool)}
              >
                <Card className="bg-white border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {pool.template.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {pool.template.tier} • {pool.frequency}
                      </p>
                    </div>
                    <Badge className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                      {pool.spotsRemaining} spots left
                    </Badge>
                  </div>

                  {pool.template.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {pool.template.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Contribution</p>
                      <p className="text-sm font-semibold text-gray-900">
                        GH₵{pool.contributionAmount}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Payout</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        GH₵{pool.payoutAmount}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Cycles</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {pool.totalCycles}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>
                        {pool.currentMemberCount}/{pool.template.maxMembers} members
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      View details →
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          isOpen={!!selectedPool}
          onClose={() => setSelectedPool(null)}
          onJoin={handleJoin}
          isJoining={joining === selectedPool.id}
        />
      )}
    </main>
  );
}
