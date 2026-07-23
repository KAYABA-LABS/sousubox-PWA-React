"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PoolDetail {
  template: { name: string; tier: string; description: string };
  contributionAmount: number;
  payoutAmount: number;
  totalCycles: number;
  currentCycle: number;
  currentMemberCount: number;
  maxMembers: number;
  frequency: string;
  nextContributionDue: string | null;
  status: string;
}

export default function PoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const { isLoaded } = useAuth();
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPoolDetails = async () => {
    try {
      const result = await api.getPoolDetails(poolId);
      setPool(result.data as unknown as PoolDetail);
    } catch {
      toast.error("Failed to load pool details");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !poolId) return;
    loadPoolDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, poolId]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Pool not found</p>
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
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Pool Details</h1>
        </div>
      </motion.header>

      <main className="flex-1 px-5 space-y-4">
        {/* Pool Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {pool.template?.name || "Pool"}
              </h2>
              <p className="text-xs text-gray-500">
                {pool.template?.tier} • {pool.frequency}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                pool.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-600"
                  : pool.status === "FORMING"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {pool.status}
            </span>
          </div>

          {pool.template?.description && (
            <p className="text-sm text-gray-500 mb-4">{pool.template.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Contribution</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ${pool.contributionAmount}
              </p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Payout</span>
              </div>
              <p className="text-lg font-semibold text-emerald-600">
                ${pool.payoutAmount}
              </p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Cycle</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {pool.currentCycle}/{pool.totalCycles}
              </p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Members</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {pool.currentMemberCount}/{pool.maxMembers}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-3">Progress</h3>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{
                width: `${Math.min((pool.currentCycle / pool.totalCycles) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round((pool.currentCycle / pool.totalCycles) * 100)}% complete</span>
            <span>{pool.totalCycles - pool.currentCycle} cycles remaining</span>
          </div>
        </motion.div>

        {/* Next Contribution */}
        {pool.nextContributionDue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
          >
            <h3 className="text-sm font-medium text-emerald-600 mb-1">Next Contribution</h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(pool.nextContributionDue).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
        )}
      </main>

      {/* Contribute CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={() => router.push(`/pools/${poolId}/contribute`)}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl"
        >
          Contribute GH₵ {pool.contributionAmount}
        </Button>
      </div>
    </main>
  );
}
