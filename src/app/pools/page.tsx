"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { usePoolStore } from "@/stores/usePoolStore";
import { usePoolService } from "@/services/poolService";
import { Users, Search, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Pools</h1>
          <Button
            onClick={() => router.push("/pools/discover")}
            className="px-4 py-2 bg-emerald-600 text-black text-sm font-semibold rounded-xl"
          >
            Discover
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-emerald-200 transition-colors"
          />
        </div>
      </motion.header>

      <main className="flex-1 px-5">
        {filteredPools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No pools yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Join a pool to start saving with others
            </p>
            <Button
              onClick={() => router.push("/pools/discover")}
              className="px-6 py-3 bg-emerald-600 text-black font-semibold rounded-xl"
            >
              Discover Pools
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPools.map((membership, index) => (
              <motion.div
                key={membership.membershipId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/pools/${membership.pool.id}`)}
              >
                <Card className="bg-white border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {membership.pool.template.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {membership.pool.template.tier} • {membership.pool.frequency}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          ${membership.pool.contributionAmount}/{membership.pool.frequency === "WEEKLY" ? "wk" : "mo"}
                        </span>
                        <span>•</span>
                        <span>
                          Cycle {membership.pool.currentCycle}/{membership.pool.totalCycles}
                        </span>
                        <span>•</span>
                        <span>
                          {membership.pool.currentMemberCount}/{membership.pool.maxMembers} members
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                           (membership.pool.status as string) === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : (membership.pool.status as string) === "FORMING"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {(membership.pool.status as string)}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Contributed: ${(membership.totalContributed as number)}</span>
                      <span>Received: ${(membership.totalReceived as number)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((membership.pool.currentCycle as number) / (membership.pool.totalCycles as number)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </main>
  );
}
