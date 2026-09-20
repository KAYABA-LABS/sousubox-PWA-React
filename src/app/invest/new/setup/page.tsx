"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import { isDevMode } from "@/lib/dev";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Leaf,
  Lock,
  Target,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PLANS: Record<string, { name: string; shortName: string; color: string; gradientFrom: string; gradientTo: string; icon: React.ElementType; minAmount: number; rate: number }> = {
  flex: { name: "Flex Save", shortName: "Flex", color: "#009961", gradientFrom: "#00B377", gradientTo: "#00874E", icon: Leaf, minAmount: 50, rate: 9.8 },
  fixed: { name: "Fixed Savings", shortName: "Fixed", color: "#4A80F0", gradientFrom: "#5B8FF9", gradientTo: "#2C5FD4", icon: Lock, minAmount: 100, rate: 14.5 },
  goal: { name: "Goal Booster", shortName: "Goal", color: "#F59E0B", gradientFrom: "#FBBF24", gradientTo: "#D97706", icon: Target, minAmount: 50, rate: 11.0 },
  auto: { name: "Auto Save Plan", shortName: "Auto", color: "#7C3AED", gradientFrom: "#8B5CF6", gradientTo: "#6D28D9", icon: RefreshCw, minAmount: 20, rate: 10.5 },
};

const FREQUENCIES = ["DAILY", "WEEKLY", "BI_WEEKLY", "MONTHLY"];
const QUICK_AMOUNTS = [50, 100, 500, 1000];

export default function PlanSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const savingsService = useSavingsService();

  const planId = searchParams.get("plan") || "flex";
  const plan = PLANS[planId] || PLANS.flex;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [targetAmount, setTargetAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = parseFloat(amount) || 0;
  const numericTarget = parseFloat(targetAmount) || 0;

  const projectedReturn = useMemo(() => {
    if (!numericAmount) return null;
    const months = 12;
    const earned = numericAmount * (plan.rate / 100) * (months / 12);
    return { earned: earned.toFixed(2), total: (numericAmount + earned).toFixed(2) };
  }, [numericAmount, plan.rate]);

  const canSubmit = name.trim() && numericAmount >= plan.minAmount && (userId || isDevMode());

  const handleSubmit = async () => {
    if (!canSubmit || (!userId && !isDevMode())) return;
    setIsSubmitting(true);
    setError("");

    try {
      const instrumentId = `pending_${Date.now()}`;

      const baseData = {
        name: name.trim(),
        targetAmount: numericTarget || numericAmount * 10,
        contributionAmount: numericAmount,
        frequency,
        startDate: new Date().toISOString().split("T")[0],
      };

      switch (planId) {
        case "flex":
          await savingsService.activateFlexibleSavings(userId || "", instrumentId, {
            ...baseData,
            configuration: {
              maxWithdrawalsPerMonth: 3,
              emergencyWithdrawalLimit: numericAmount * 0.5,
              emergencyWithdrawalFee: 0.05,
              minimumBalance: 0,
            },
          });
          break;
        case "fixed":
          await savingsService.activateTimeLock(userId || "", instrumentId, {
            ...baseData,
            configuration: {
              lockPeriodDays: 365,
              earlyWithdrawalPenalty: 0.1,
              allowPartialLocks: false,
            },
          });
          break;
        case "goal":
          await savingsService.activateTargetFund(userId || "", instrumentId, {
            ...baseData,
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            configuration: {
              allowPartialWithdrawal: false,
            },
          });
          break;
        case "auto":
          await savingsService.activateAutoSave(userId || "", instrumentId, {
            ...baseData,
            configuration: {
              deductionSource: "SAVINGS_ACCOUNT",
              minimumBalance: 0,
              contributionDay: new Date().getDate(),
            },
          });
          break;
      }

      setIsSuccess(true);
      toast.success("Plan created successfully");
      setTimeout(() => router.push("/invest"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create plan. Please try again.";
      toast.error(message);
      setError(message);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${plan.color}20` }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: plan.color }} />
        </motion.div>
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-2">Plan Created!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Your {plan.name} plan is now active.
        </p>
      </main>
    );
  }

  const PlanIcon = plan.icon;

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
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#0C0F14] dark:text-white">Set Up {plan.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure your savings plan</p>
          </div>
        </div>
      </motion.header>

      {/* Preview Card */}
      <div className="mx-5 mb-6">
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${plan.gradientFrom}, ${plan.gradientTo})` }}
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full border-4 border-gray-200" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
              <PlanIcon className="w-5 h-5 text-gray-900" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-gray-200 rounded-md px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-[9px] font-bold text-gray-900 tracking-wider">
                {plan.shortName.toUpperCase()} SAVINGS
              </span>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">{name.trim() || plan.name}</p>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-[10px] text-gray-900/60">Starting amount</p>
              <p className="text-sm font-semibold text-gray-900">
                GH₵ {numericAmount > 0 ? numericAmount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-900/60">Projected (12mo)</p>
              <p className="text-sm font-semibold text-gray-900">
                {projectedReturn ? `GH₵ ${projectedReturn.total}` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 space-y-5">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund"
            className="w-full h-12 px-4 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-xl text-[#0C0F14] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-emerald-200 dark:focus:border-emerald-500/40 transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contribution Amount (GH₵)
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min. GH₵ ${plan.minAmount}`}
            min={plan.minAmount}
            className="w-full h-12 px-4 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-xl text-[#0C0F14] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-emerald-200 dark:focus:border-emerald-500/40 transition-colors"
          />
          <div className="flex gap-2 mt-2">
            {QUICK_AMOUNTS.filter((a) => a >= plan.minAmount).map((a) => (
              <Button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  numericAmount === a
                    ? "text-gray-900"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={numericAmount === a ? { backgroundColor: plan.color } : {}}
              >
                GH₵ {a}
              </Button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
          <div className="grid grid-cols-4 gap-2">
            {FREQUENCIES.map((f) => (
              <Button
                key={f}
                onClick={() => setFrequency(f)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  frequency === f
                    ? "text-gray-900"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={frequency === f ? { backgroundColor: plan.color } : {}}
              >
                {f.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>

        {/* Target Amount (for goal plan) */}
        {planId === "goal" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Amount (GH₵)
            </label>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full h-12 px-4 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-xl text-[#0C0F14] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-emerald-200 dark:focus:border-emerald-500/40 transition-colors"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-[#FBF6EF] dark:bg-[#0C0F14] border-t border-gray-200 dark:border-white/10">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full py-4 rounded-xl text-gray-900 font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: plan.color }}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Plan"
          )}
        </Button>
      </div>
    </main>
  );
}
