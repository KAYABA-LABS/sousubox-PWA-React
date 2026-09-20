"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import { api } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { btn } from "@/lib/variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Pause,
  ArrowUpRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

const TYPE_COLORS: Record<string, string> = {
  FLEXIBLE_SAVINGS: "#009961",
  TIMELOCK_VAULT: "#4A80F0",
  TARGET_FUND: "#F59E0B",
  AUTOSAVE: "#7C3AED",
};

export default function ActivePlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const { userId, isLoaded } = useAuth();
  const savingsService = useSavingsService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plan, setPlan] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [contributeSuccess, setContributeSuccess] = useState(false);

  const loadPlan = async () => {
    if (!userId && !isDevMode()) return;
    try {
      const data = await savingsService.getInstrumentById(userId || "", planId);
      setPlan(data as Record<string, unknown>);
    } catch {
      toast.error("Failed to load plan");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode()) || !planId) return;
    loadPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId, planId]);

  const handleContribute = async () => {
    if ((!userId && !isDevMode()) || !contributeAmount) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsContributing(true);
    try {
      await api.contributeToSavings(userId || "", planId, amount);
      setContributeSuccess(true);
      toast.success(`GH₵ ${amount.toFixed(2)} contributed successfully`);
      setTimeout(() => {
        setShowContributeModal(false);
        setContributeSuccess(false);
        setContributeAmount("");
        loadPlan();
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Contribution failed");
    }
    setIsContributing(false);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Plan not found</p>
      </div>
    );
  }

  const color = TYPE_COLORS[plan.type] || "#0D4F3C";
  const progress = plan.targetAmount > 0 ? Math.min((plan.currentBalance / plan.targetAmount) * 100, 100) : 0;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24">
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
          <h1 className="text-lg font-bold text-[#0C0F14] dark:text-white">{plan.name}</h1>
        </div>
      </motion.header>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 rounded-2xl p-5 relative overflow-hidden"
        style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1 }}
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full border-4" style={{ borderColor: `${color}10` }} />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">CURRENT BALANCE</p>
        <h2 className="text-3xl font-extrabold text-[#0C0F14] dark:text-white mt-1">
          GH₵ {plan.currentBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
        </h2>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-xs font-semibold" style={{ color }}>10% p.a.</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Target: GH₵ {plan.targetAmount?.toLocaleString() || "0"}
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-4 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
          <p className="text-sm font-semibold" style={{ color }}>{progress.toFixed(0)}%</p>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>GH₵ {plan.currentBalance?.toLocaleString() || "0"} saved</span>
          <span>GH₵ {plan.targetAmount?.toLocaleString() || "0"} target</span>
        </div>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mt-4 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl divide-y divide-gray-200 dark:divide-white/10"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Contribution Amount</p>
            <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">GH₵ {plan.contributionAmount?.toLocaleString() || "0"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">{plan.frequency?.replace("_", " ").toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Monthly"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-semibold" style={{ color }}>{plan.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
            <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">{plan.type?.replace("_", " ") || "Savings"}</p>
          </div>
        </div>
      </motion.div>

      {/* Next Contribution */}
      {plan.nextContributionDue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-5 mt-4 rounded-2xl p-4"
          style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, borderWidth: 1 }}
        >
          <p className="text-xs font-semibold" style={{ color }}>NEXT CONTRIBUTION</p>
          <p className="text-lg font-bold text-[#0C0F14] dark:text-white mt-1">
            {new Date(plan.nextContributionDue).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-[#FBF6EF] dark:bg-[#0C0F14] border-t border-gray-200 dark:border-white/10">
        <div className="flex gap-3">
          <Button
            onClick={() => toast.info("Pause feature coming soon")}
            className={btn({ variant: "secondary", size: "lg" })}
          >
            <Pause className="w-4 h-4" />
            Pause
          </Button>
          <Button
            onClick={() => setShowContributeModal(true)}
            className={btn({ variant: "primary", size: "lg" })}
            style={{ backgroundColor: color }}
          >
            <ArrowUpRight className="w-4 h-4" />
            Contribute
          </Button>
        </div>
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContributeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => !isContributing && setShowContributeModal(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-lg bg-white dark:bg-[#151A1F] rounded-t-3xl sm:rounded-3xl overflow-hidden"
            >
              {contributeSuccess ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color }} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#0C0F14] dark:text-white mb-2">Contribution Successful!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GH₵ {parseFloat(contributeAmount || "0").toFixed(2)} has been added to your savings.
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-5 pt-5 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-[#0C0F14] dark:text-white">Make a Contribution</h2>
                      <Button variant="ghost" size="icon" onClick={() => setShowContributeModal(false)} disabled={isContributing}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add funds to your <span className="text-[#0C0F14] dark:text-white font-medium">{plan.name}</span> savings plan.
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (GH₵)</label>
                      <Input
                        type="number"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        placeholder={`Min. GH₵ ${plan.contributionAmount || 1}`}
                        className="h-14 text-lg"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[plan.contributionAmount, plan.contributionAmount * 2, plan.contributionAmount * 5].filter(Boolean).map((amt) => (
                        <Button
                          key={amt}
                          variant="secondary"
                          onClick={() => setContributeAmount(String(amt))}
                          className="flex-1"
                        >
                          GH₵ {amt}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={handleContribute}
                      disabled={isContributing || !contributeAmount || parseFloat(contributeAmount) <= 0}
                      className={btn({ variant: "primary", size: "lg" })}
                      style={{ backgroundColor: color }}
                    >
                      {isContributing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        `Contribute GH₵ ${parseFloat(contributeAmount || "0").toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
