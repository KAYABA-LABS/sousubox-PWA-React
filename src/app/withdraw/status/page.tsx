"use client";

import { motion } from "framer-motion";
import { useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CheckCircle2, XCircle, ArrowRight, Info, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

interface WithdrawalData {
  amount: string;
  referenceCode: string;
  status?: string;
  displayText?: string;
  networkLabel?: string;
  phone?: string;
}

function WithdrawStatusContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const searchParams = useSearchParams();

  const withdrawalData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as WithdrawalData) : null;
  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, router]);

  if (!withdrawalData) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  const isSuccess = withdrawalData.status?.toLowerCase() === "success";
  const isFailed = withdrawalData.status?.toLowerCase() === "failed";

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col relative overflow-hidden">
      {isSuccess ? (
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      ) : (
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      )}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center px-5 py-12 max-w-lg mx-auto w-full z-10">
        {/* Status Icon Indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="mb-6"
        >
          {isSuccess ? (
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
            </div>
          ) : isFailed ? (
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center border border-red-300 dark:border-red-500/30">
              <XCircle className="w-12 h-12 text-red-500 dark:text-red-400" strokeWidth={2} />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center border border-amber-300 dark:border-amber-500/30 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-amber-500/20 border-t-amber-500/60"
              />
              <Clock className="w-12 h-12 text-amber-500 dark:text-amber-400" strokeWidth={2} />
            </div>
          )}
        </motion.div>

        {/* Text Header Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#0C0F14] dark:text-white mb-2">
            {isSuccess ? "Withdrawal Successful" : isFailed ? "Withdrawal Failed" : "Withdrawal Pending"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
            {isSuccess
              ? "Your funds are on their way to your mobile money account"
              : isFailed
              ? "We could not process this withdrawal request"
              : "Your withdrawal is being processed"}
          </p>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4"
        >
          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] shadow-xl text-center relative overflow-hidden">
            <CardHeader className="pb-4">
              <CardDescription className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Amount
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-1 text-[#0C0F14] dark:text-white tracking-tight">
                GH₵ {parseFloat(withdrawalData.amount).toFixed(2)}
              </CardTitle>
              {withdrawalData.networkLabel && (
                <div className="mt-2 flex justify-center">
                  <Badge variant="outline" className="text-xs border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-md">
                    {withdrawalData.networkLabel}
                  </Badge>
                </div>
              )}
            </CardHeader>
          </Card>

          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Reference code</span>
                <span className="text-[#0C0F14] dark:text-white font-mono font-medium">{withdrawalData.referenceCode}</span>
              </div>

              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Withdrawal status</span>
                {isSuccess ? (
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-md">
                    Success
                  </Badge>
                ) : isFailed ? (
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-md">
                    Failed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold rounded-md animate-pulse">
                    Pending
                  </Badge>
                )}
              </div>

              {withdrawalData.phone && (
                <div className="p-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Destination</span>
                  <span className="text-[#0C0F14] dark:text-white font-mono">{withdrawalData.phone}</span>
                </div>
              )}

              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Processing speed</span>
                <span className="text-[#0C0F14] dark:text-white font-medium">
                  {isSuccess ? "Completed" : "Typically within 24 hours"}
                </span>
              </div>
            </CardContent>
          </Card>

          {withdrawalData.displayText && (
            <Alert className="bg-blue-50 dark:bg-blue-500/[0.02] border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl p-5">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-sm font-semibold">Update</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1 text-blue-700/80 dark:text-blue-300/80">
                {withdrawalData.displayText}
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && !isFailed && (
            <Alert className="bg-emerald-50 dark:bg-emerald-500/[0.02] border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl p-5">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-sm font-semibold">Next Steps</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1 text-gray-500 dark:text-gray-400">
                <ul className="space-y-1.5 list-disc pl-3.5">
                  <li>Funds will be sent to your linked mobile money account.</li>
                  <li>You can track this withdrawal from your dashboard activity log.</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Footer CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full mt-8">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#0D4F3C]/10 flex items-center justify-center gap-2"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export default function WithdrawStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
        </div>
      }
    >
      <WithdrawStatusContent />
    </Suspense>
  );
}
