"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsStore } from "@/stores/useSavingsStore";
import { useSavingsService } from "@/services/savingsService";
import { useKycService } from "@/services/kycService";
import { isDevMode } from "@/lib/dev";
import {
  Lock,
  Target,
  Wallet,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";
import type { SavingsGoal } from "@/lib/api";

const SAVINGS_PLANS = [
  {
    id: "auto",
    planId: "auto",
    name: "Auto Save Plan",
    description: "Build savings automatically without thinking.",
    rate: "10% p.a.",
    color: "#7C3AED",
    icon: RefreshCw,
  },
  {
    id: "vault",
    planId: "vault",
    name: "Lock Vault",
    description: "Lock your money for a set period and earn returns.",
    rate: "12% p.a.",
    color: "#4A80F0",
    icon: Lock,
  },
  {
    id: "flex",
    planId: "flex",
    name: "Flex Save",
    description: "Access your money anytime while earning steady growth.",
    rate: "10% p.a.",
    color: "#009961",
    icon: Wallet,
  },
  {
    id: "target",
    planId: "target",
    name: "Target Goal",
    description: "Save towards a target and stay on track.",
    rate: "10% p.a.",
    color: "#F59E0B",
    icon: Target,
  },
];

export default function InvestPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const savingsService = useSavingsService();
  const kycService = useKycService();
  const { goals, setGoals, isLoading, setLoading } = useSavingsStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  const initializeScreen = async () => {
    if (!userId && !isDevMode()) return;
    setLoading(true);
    try {
      const status = await kycService.getStatus(userId || "");
      setKycStatus(status?.status || "NOT_SUBMITTED");

      if (status?.status === "VERIFIED") {
        const data = await savingsService.getSavingsGoals(userId || "");
        setGoals(data);
      }
    } catch {
      toast.error("Failed to load savings");
    }
    setLoading(false);
    setKycLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    initializeScreen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const totalSaved = goals.reduce<number>((sum: number, g: SavingsGoal) => sum + g.balance, 0);
  const activePlans = goals.filter((g: SavingsGoal) => g.status === "ACTIVE").length;

  if (!isLoaded || kycLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  if (kycStatus !== "VERIFIED") {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center px-5 pb-32">
        <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-[#0D4F3C] dark:text-[#156B53]" />
        </div>
        <h2 className="text-lg font-semibold text-[#0C0F14] dark:text-white mb-2">Complete KYC Verification</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Verify your identity to create and manage saving plans
        </p>
        <Button
          onClick={() => router.push("/kyc")}
          className="px-6 py-3 bg-[#0D4F3C] text-white font-semibold rounded-xl"
        >
          Start Verification
        </Button>
        <Dock activeItem="invest" onItemClick={(href) => router.push(href)} />
      </main>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white">My Investments</h1>
          <Button className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center" aria-label="Help">
            <span className="text-gray-500 dark:text-gray-400 text-lg">?</span>
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose any of our savings options to start growing. Start now to join many others grow their money.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-4 bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 rounded-2xl p-5 overflow-hidden relative"
      >
        <div className="absolute -right-12 -top-14 w-44 h-44 rounded-full border-[35px] border-gray-200 dark:border-white/10" />
        <div className="absolute -right-4 top-4 w-28 h-28 rounded-full border-[25px] border-gray-200 dark:border-white/10" />

        <div className="inline-block bg-[#0D4F3C]/20 dark:bg-[#156B53]/20 rounded-md px-3 py-1 mb-3">
          <Badge className="text-[10px] font-bold text-gray-900 dark:text-white tracking-wider bg-[#0D4F3C]/20 dark:bg-[#156B53]/20">PERSONAL SAVINGS</Badge>
        </div>

        <p className="text-xs text-gray-900/60 dark:text-white/60 mb-1">Total Balance</p>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-[#0C0F14] dark:text-white">
            {balanceVisible ? `GH₵${totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "GH₵ ••••••"}
          </h2>
          <Button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-gray-900/60 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
            aria-label={balanceVisible ? "Hide balance" : "Show balance"}
          >
            {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push("/invest/new")}
            className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl px-4 py-2.5 transition-colors"
          >
            <span className="text-sm font-semibold text-[#0C0F14] dark:text-white">New Investment +</span>
          </Button>
          <Button className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg px-3 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">9.1% increase</span>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-4"
      >
        <Card className="bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider font-semibold mb-1">PORTFOLIO SUMMARY</p>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#0C0F14] dark:text-white">GH₵ {totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
            <Badge className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-2 py-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+8.2%</span>
            </Badge>
          </div>

          <div className="flex items-center divide-x divide-gray-200 dark:divide-white/10">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Active Plans</p>
              <p className="text-base font-bold text-[#0C0F14] dark:text-white mt-1">{activePlans}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Total Returns</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">GH₵ 0.00</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Avg. Rate</p>
              <p className="text-base font-bold text-[#0C0F14] dark:text-white mt-1">10%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0C0F14] dark:text-white">Good Opportunities</h2>
          <Button className="text-sm text-[#0D4F3C] dark:text-[#156B53] font-semibold">View all</Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SAVINGS_PLANS.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => router.push(`/invest/new?plan=${plan.planId}`)}
                  className="relative rounded-2xl p-4 text-left overflow-hidden h-40 flex flex-col justify-between w-full"
                  style={{ backgroundColor: plan.color }}
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full border-4 border-gray-200" />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-900" />
                    </div>
                    <span className="bg-gray-200 rounded-md px-2 py-0.5 text-[10px] font-bold text-gray-900">
                      {plan.rate}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-[11px] text-gray-900/80 mt-0.5 line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-gray-900/50" />
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {goals.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-3">Your Goals</h2>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {goals.map((goal: any, index: number) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0C0F14] dark:text-white">{goal.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{goal.type.replace("_", " ")}</p>
                    </div>
                    <Badge
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        goal.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : goal.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                      }`}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#0D4F3C] rounded-full"
                      style={{
                        width: `${goal.target > 0 ? Math.min((goal.balance / goal.target) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>GH₵{goal.balance.toLocaleString()} saved</span>
                    <span>GH₵{goal.target.toLocaleString()} target</span>
                  </div>
                  {goal.dueDays !== null && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                      {goal.dueDays > 0 ? `Due in ${goal.dueDays} days` : "Overdue"}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Dock activeItem="invest" onItemClick={(href) => router.push(href)} />
    </main>
  );
}
