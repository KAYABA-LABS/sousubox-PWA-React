"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import { isDevMode } from "@/lib/dev";
import { ArrowLeft, TrendingUp, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { SavingsGoal } from "@/lib/api";

export default function PortfolioPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const savingsService = useSavingsService();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const loadPortfolio = async () => {
    if (!userId && !isDevMode()) return;
    try {
      const data = await savingsService.getSavingsGoals(userId || "");
      setGoals(data);
    } catch {
      toast.error("Failed to load portfolio");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    loadPortfolio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const totalSaved = goals.reduce<number>((sum, g) => sum + g.balance, 0);
  const activePlans = goals.filter((g) => g.status === "ACTIVE").length;
  const completedPlans = goals.filter((g) => g.status === "COMPLETED").length;
  const avgRate = 10.0;

  const typeColors: Record<string, string> = {
    FLEXIBLE_SAVINGS: "#009961",
    TIMELOCK_VAULT: "#4A80F0",
    TARGET_FUND: "#F59E0B",
    AUTOSAVE: "#7C3AED",
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32">
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
          <h1 className="text-lg font-bold text-[#0C0F14] dark:text-white">Portfolio</h1>
        </div>
      </motion.header>

      {/* Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">TOTAL BALANCE</p>
          <Button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label={balanceVisible ? "Hide balance" : "Show balance"}
          >
            {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <h2 className="text-3xl font-extrabold text-[#0C0F14] dark:text-white mb-1">
          {balanceVisible ? `GH₵ ${totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "GH₵ ••••••"}
        </h2>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{avgRate}% avg. return</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-4 grid grid-cols-3 gap-3"
      >
        <Card className="bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-center shadow-none">
          <p className="text-2xl font-bold text-[#0C0F14] dark:text-white">{activePlans}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Plans</p>
        </Card>
        <Card className="bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-center shadow-none">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedPlans}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
        </Card>
        <Card className="bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-center shadow-none">
          <p className="text-2xl font-bold text-[#0C0F14] dark:text-white">{goals.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Plans</p>
        </Card>
      </motion.div>

      {/* Plans List */}
      <div className="px-5 mt-6">
        <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-3">Your Plans</h2>
        {goals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400">No plans yet. Start investing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/invest/plan/${goal.id}`)}
                className="bg-white dark:bg-[#151A1F] border border-gray-200 dark:border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0C0F14] dark:text-white">{goal.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{goal.type.replace("_", " ")}</p>
                  </div>
                  <Badge
                    className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: `${typeColors[goal.type] || "#666"}20`,
                      color: typeColors[goal.type] || "#999",
                    }}
                  >
                    {goal.status}
                  </Badge>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(goal.target as number) > 0 ? Math.min(((goal.balance as number) / (goal.target as number)) * 100, 100) : 0}%`,
                      backgroundColor: typeColors[goal.type as string] || "#0D4F3C",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>GH₵ {(goal.balance as number).toLocaleString()} saved</span>
                  <span>GH₵ {(goal.target as number).toLocaleString()} target</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
