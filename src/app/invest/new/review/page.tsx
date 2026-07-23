"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Leaf,
  Lock,
  Target,
  RefreshCw,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PLANS: Record<string, { name: string; shortName: string; color: string; gradientFrom: string; gradientTo: string; icon: React.ElementType; rate: number }> = {
  flex: { name: "Flex Save", shortName: "Flex", color: "#009961", gradientFrom: "#00B377", gradientTo: "#00874E", icon: Leaf, rate: 9.8 },
  fixed: { name: "Fixed Savings", shortName: "Fixed", color: "#4A80F0", gradientFrom: "#5B8FF9", gradientTo: "#2C5FD4", icon: Lock, rate: 14.5 },
  goal: { name: "Goal Booster", shortName: "Goal", color: "#F59E0B", gradientFrom: "#FBBF24", gradientTo: "#D97706", icon: Target, rate: 11.0 },
  auto: { name: "Auto Save Plan", shortName: "Auto", color: "#7C3AED", gradientFrom: "#8B5CF6", gradientTo: "#6D28D9", icon: RefreshCw, rate: 10.5 },
};

export default function PlanReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const savingsService = useSavingsService();

  const planId = searchParams.get("plan") || "flex";
  const planName = searchParams.get("name") || "My Savings";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const frequency = searchParams.get("frequency") || "MONTHLY";
  const targetAmount = parseFloat(searchParams.get("target") || "0");

  const plan = PLANS[planId] || PLANS.flex;
  const Icon = plan.icon;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const projectedReturn = amount * (plan.rate / 100);
  const totalAfter12Months = amount + projectedReturn;

  const handleSubmit = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setError("");

    try {
      // eslint-disable-next-line react-hooks/purity
      const instrumentId = `pending_${Date.now()}`;
      const baseData = {
        name: planName,
        targetAmount: targetAmount || amount * 10,
        contributionAmount: amount,
        frequency,
        startDate: new Date().toISOString().split("T")[0],
      };

      switch (planId) {
        case "flex":
          await savingsService.activateFlexibleSavings(userId, instrumentId, {
            ...baseData,
            configuration: { maxWithdrawalsPerMonth: 3, emergencyWithdrawalLimit: amount * 0.5, emergencyWithdrawalFee: 0.05, minimumBalance: 0 },
          });
          break;
        case "fixed":
          await savingsService.activateTimeLock(userId, instrumentId, {
            ...baseData,
            configuration: { lockPeriodDays: 365, earlyWithdrawalPenalty: 0.1, allowPartialLocks: false },
          });
          break;
        case "goal":
          await savingsService.activateTargetFund(userId, instrumentId, {
            ...baseData,
            // eslint-disable-next-line react-hooks/purity
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            configuration: { allowPartialWithdrawal: false },
          });
          break;
        case "auto":
          await savingsService.activateAutoSave(userId, instrumentId, {
            ...baseData,
            configuration: { deductionSource: "SAVINGS_ACCOUNT", minimumBalance: 0, contributionDay: new Date().getDate() },
          });
          break;
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create plan.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${plan.color}20` }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: plan.color }} />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan Created!</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your {plan.name} plan is now active.
        </p>
        <Button
          onClick={() => router.push("/invest")}
          className="px-6 py-3 rounded-xl text-gray-900 font-semibold"
          style={{ backgroundColor: plan.color }}
        >
          View Portfolio
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
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Review Plan</h1>
        </div>
      </motion.header>

      {/* Plan Card */}
      <div className="mx-5 mb-6">
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${plan.gradientFrom}, ${plan.gradientTo})` }}
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full border-4 border-gray-200" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <p className="text-xs text-gray-900/60 uppercase tracking-wider font-bold">{plan.shortName} Savings</p>
              <p className="text-lg font-bold text-gray-900">{planName}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-900/60">Monthly Contribution</p>
              <p className="text-xl font-bold text-gray-900">GH₵ {amount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-900/60">Rate</p>
              <p className="text-xl font-bold text-gray-900">{plan.rate}% p.a.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex-1 px-5 space-y-4">
        <h2 className="text-base font-bold text-gray-900">Plan Summary</h2>

        <Card className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-200 shadow-none">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Contribution Amount</p>
              <p className="text-sm font-semibold text-gray-900">GH₵ {amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="text-sm font-semibold text-gray-900">{frequency.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="text-sm font-semibold text-gray-900">{plan.rate}% p.a.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Estimated Return (12 months)</p>
              <p className="text-sm font-semibold text-emerald-600">+GH₵ {projectedReturn.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Projected Total */}
        <Card className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Projected Total (12 months)</p>
              <p className="text-2xl font-bold text-gray-900">GH₵ {totalAfter12Months.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl text-gray-900 font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: plan.color }}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Confirm & Create Plan"
          )}
        </Button>
      </div>
    </main>
  );
}
