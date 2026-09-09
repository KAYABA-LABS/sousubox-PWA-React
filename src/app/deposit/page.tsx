"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark, CreditCard, Shield, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const depositMethods = [
  {
    id: "momo",
    name: "Mobile Money",
    description: "MTN, Vodafone/Telecel, AirtelTigo",
    icon: CreditCard,
    processingTime: "Instant",
    badge: "Recommended",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank wire / ACH transfer",
    icon: Landmark,
    processingTime: "COMING SOON",
    badge: "No Fee",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  // {
  //   id: "card",
  //   name: "Debit Card",
  //   description: "Instant via Visa or MasterCard",
  //   icon: CreditCard,
  //   processingTime: "Instant",
  // },
];

export default function DepositPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [balance, setBalance] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (userId) {
      api.getUserProfile(userId)
        .then((res) => {
          if (res.success && res.data) {
            // Using totalAmountSaved or 0 as current balance display
            setBalance(res.data.stats?.totalAmountSaved || 0);
          }
        })
        .catch((err) => {
          console.error("Failed to load user profile in deposit:", err);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, [userId, isLoaded, user, router]);

  const handleMethodSelect = (methodId: string) => {
    router.push(`/deposit/amount?method=${methodId}`);
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
              Deposit Funds
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add capital to your Susu account</p>
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
          {/* Current Balance Card */}
          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="text-center pb-2">
              <CardDescription className="text-xs font-medium tracking-wider uppercase text-emerald-600 dark:text-emerald-400/80 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Available Balance
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-1 text-[#0C0F14] dark:text-white tracking-tight">
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  `GH₵ ${balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Deposit Methods Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
              Select Deposit Method
            </h2>
            <div className="grid gap-4">
              {depositMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full text-left bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] hover:border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                        <Icon className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#0C0F14] dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                            {method.name}
                          </span>
                          {method.badge && (
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold rounded-md border ${method.badgeColor}`}>
                              {method.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {method.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {method.processingTime}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Info Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-emerald-50/60 dark:bg-emerald-500/[0.02] border border-emerald-200 dark:border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4 shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                Withdrawal Unlock Requirements
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                A minimum cumulative deposit of <span className="text-[#0C0F14] dark:text-white font-medium">GH₵ 350.00</span> is required to fully activate and unlock your withdrawal capabilities.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
