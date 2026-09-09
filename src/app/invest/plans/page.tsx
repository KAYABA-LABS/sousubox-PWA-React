"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import { isDevMode } from "@/lib/dev";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SavingsGoal } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  FLEXIBLE_SAVINGS: "#009961",
  TIMELOCK_VAULT: "#4A80F0",
  TARGET_FUND: "#F59E0B",
  AUTOSAVE: "#7C3AED",
};

export default function AllActivePlansPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const savingsService = useSavingsService();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = async () => {
    if (!userId && !isDevMode()) return;
    try {
      const data = await savingsService.getSavingsGoals(userId || "");
      setGoals(data.filter((g) => g.status === "ACTIVE"));
    } catch {
      toast.error("Failed to load plans");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    loadPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32">
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
          <h1 className="text-lg font-bold text-[#0C0F14] dark:text-white">All Active Plans</h1>
        </div>
      </motion.header>

      <div className="flex-1 px-5">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-500 dark:text-gray-400">No active plans</p>
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
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: TYPE_COLORS[goal.type] || "#0D4F3C" }} />
                    <span className="text-xs font-semibold" style={{ color: TYPE_COLORS[goal.type] || "#0D4F3C" }}>
                      10% p.a.
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${goal.target > 0 ? Math.min((goal.balance / goal.target) * 100, 100) : 0}%`,
                      backgroundColor: TYPE_COLORS[goal.type] || "#0D4F3C",
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
