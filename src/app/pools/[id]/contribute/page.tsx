"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface PoolData {
  template: { name: string };
  contributionAmount: number;
}

export default function PoolContributePage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const { userId, isLoaded } = useAuth();
  const [pool, setPool] = useState<PoolData | null>(null);
  const [amount, setAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPool = async () => {
    try {
      const result = await api.getPoolDetails(poolId);
      const poolData = result.data as unknown as PoolData;
      setPool(poolData);
      if (poolData?.contributionAmount) {
        setAmount(String(poolData.contributionAmount));
      }
    } catch {
      toast.error("Failed to load pool");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !poolId) return;
    loadPool();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, poolId]);

  const handleContribute = async () => {
    if (!userId || !poolId) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsContributing(true);
    try {
      await api.contributeToPool(userId, poolId, numAmount);
      setIsSuccess(true);
      toast.success(`GH₵ ${numAmount.toFixed(2)} contributed to pool`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Contribution failed");
    }
    setIsContributing(false);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contribution Successful!</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          GH₵ {parseFloat(amount || "0").toFixed(2)} has been contributed to {pool?.template?.name || "the pool"}.
        </p>
        <Button
          onClick={() => router.push(`/pools/${poolId}`)}
          className="bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl px-6"
        >
          View Pool
        </Button>
      </main>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Contribute to Pool</h1>
        </div>
      </motion.header>

      <div className="flex-1 px-5 space-y-6">
        {/* Pool Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pool</p>
                <p className="text-base font-bold text-gray-900">{pool?.template?.name || "Pool"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Required</p>
                <p className="text-base font-bold text-emerald-600">GH₵ {pool?.contributionAmount || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Amount Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contribution Amount (GH₵)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-14 text-lg"
          />
        </motion.div>

        {/* Quick Amounts */}
        {pool?.contributionAmount && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2">
            {[pool.contributionAmount, pool.contributionAmount * 2, pool.contributionAmount * 5].map((amt) => (
              <Button
                key={amt}
                variant="secondary"
                onClick={() => setAmount(String(amt))}
                className={parseFloat(amount) === amt ? "border-emerald-600 text-emerald-600" : ""}
              >
                GH₵ {amt}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Notice */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-emerald-50 border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-900 font-medium">Insurance Mechanism</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your contribution is protected. If another member defaults, the joining fee covers the shortfall.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={handleContribute}
          disabled={isContributing || !amount || parseFloat(amount) <= 0}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl"
        >
          {isContributing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Contribute GH₵ ${parseFloat(amount || "0").toFixed(2)}`
          )}
        </Button>
      </div>
    </main>
  );
}
