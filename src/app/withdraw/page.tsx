"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, Plus, Smartphone, Sparkles } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type FundingSource } from "@/lib/api";
import { usePoolService } from "@/services/poolService";
import { useSavingsService } from "@/services/savingsService";
import { useUserService } from "@/services/userService";
import { getNetworkLabel, maskLast4, extractLast4 } from "@/lib/momo";

export default function WithdrawPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const poolService = usePoolService();
  const savingsService = useSavingsService();
  const userService = useUserService();

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const loadWithdrawData = async () => {
      try {
        const [userPools, savingsGoals, profileResult, sources] = await Promise.all([
          poolService.getUserPools(userId || ""),
          savingsService.getSavingsGoals(userId || ""),
          api.getUserProfile(userId || "").catch(() => null),
          userService.getFundingSources(userId || "").catch(() => []),
        ]);

        const lockedInPools = userPools.reduce((acc, p) => acc + (p.totalContributed || 0), 0);
        const personalSavings = savingsGoals.reduce((acc, s) => acc + (s.balance || 0), 0);
        const totalAmountSaved = profileResult?.data?.stats?.totalAmountSaved || 0;

        setAvailableBalance(Math.max(0, totalAmountSaved - lockedInPools - personalSavings));
        setFundingSources(sources);
      } catch (err) {
        console.error("Failed to load withdrawal data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWithdrawData();
    // poolService/savingsService are re-created every render (not memoized) — omitted
    // from deps to avoid a fetch loop, matching ClientDashboard.tsx's same pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isLoaded, user, router]);

  const sortedSources = [...fundingSources].sort((a, b) => Number(b.active) - Number(a.active));

  const handleSourceSelect = (source: FundingSource) => {
    router.push(
      `/withdraw/amount?networkId=${source.networkId}&phoneNumber=${encodeURIComponent(source.phoneNumber)}`
    );
  };

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col relative overflow-hidden">
      {/* Decorative Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header role="banner" className="bg-[#FBF6EF]/80 dark:bg-[#0C0F14]/80 backdrop-blur-md sticky top-0 z-50 px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:text-[#0C0F14] dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white tracking-tight flex items-center gap-2">
              Withdraw Funds
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Move money out of your Susu account</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </header>

      <div className="flex-grow flex flex-col items-center justify-start px-5 py-8 max-w-2xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 w-full"
        >
          {/* Available Balance Card */}
          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="text-center pb-2">
              <CardDescription className="text-xs font-medium tracking-wider uppercase text-emerald-600 dark:text-emerald-400/80 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Available Balance
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-1 text-[#0C0F14] dark:text-white tracking-tight">
                {isLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  `GH₵ ${availableBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Withdrawal Channels Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
              Select Withdrawal Destination
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : sortedSources.length === 0 ? (
              <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-8 text-center">
                <Smartphone className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-[#0C0F14] dark:text-white font-medium mb-1">No mobile money numbers linked yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Link a mobile money number to withdraw funds to it.
                </p>
                <Button
                  onClick={() => router.push("/settings/add-account")}
                  className="bg-[#0D4F3C] hover:bg-[#156B53] text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Link a number
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedSources.map((source, index) => {
                  const key = `${source.networkId}-${source.phoneNumber}`;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleSourceSelect(source)}
                        className="w-full text-left bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] hover:border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                          <Smartphone className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#0C0F14] dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                              {getNetworkLabel(source.networkId)}
                            </span>
                            {source.active && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 font-semibold rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              >
                                PRIMARY
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                            {maskLast4(extractLast4(source.phoneNumber))}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                      </button>
                    </motion.div>
                  );
                })}

                <button
                  onClick={() => router.push("/settings/add-account")}
                  className="w-full text-left bg-transparent border-[1.5px] border-dashed border-black/15 dark:border-white/15 rounded-2xl p-4 flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 hover:text-[#0D4F3C] dark:hover:text-[#156B53] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Link another number
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
