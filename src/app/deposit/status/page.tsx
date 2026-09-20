"use client";

import { motion } from "framer-motion";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CheckCircle2, XCircle, ShieldAlert, ArrowRight, Info, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

interface DepositData {
  method: string;
  methodName: string;
  amount: string;
  referenceCode: string;
  status?: string;
  displayText?: string;
  phone?: string;
  providerName?: string;
}

function DepositStatusContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] = useState("");
  const [blocked, setBlocked] = useState(false);

  const depositData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as DepositData) : null;
  }, [searchParams]);

  useEffect(() => {
    if (depositData && !blocked) {
      try {
        sessionStorage.setItem("pending_deposit", depositData.amount);
        sessionStorage.setItem("pending_deposit_ts", String(Date.now()));
      } catch {
        // ignore storage errors
      }
    }
  }, [depositData, blocked]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const forceBlocked = searchParams.get("force_blocked");
    if (forceBlocked) {
      setBlocked(true);
      setErrorMsg(
        "Your account requires security compliance verification. This deposit cannot be automatically credited. Please contact customer support."
      );
    }
  }, [userId, isLoaded, user, router, searchParams]);

  if (!depositData) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  // Determine status and style configurations
  const isSuccess = depositData.status?.toLowerCase() === "success";
  const isFailed = depositData.status?.toLowerCase() === "failed";
  const isMomo = depositData.method === "momo";

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col relative overflow-hidden">
      {/* Decorative Radial Backgrounds */}
      {blocked ? (
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      ) : isSuccess ? (
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      ) : (
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      )}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center px-5 py-12 max-w-lg mx-auto w-full z-10">
        {/* Compliance Error Banner */}
        {blocked && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-6"
          >
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-5">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <AlertTitle className="text-sm font-semibold">Account Blocked</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                {errorMsg}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Status Icon Indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="mb-6"
        >
          {blocked ? (
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center border border-red-300 dark:border-red-500/30">
              <ShieldAlert className="w-12 h-12 text-red-500 dark:text-red-400" strokeWidth={2} />
            </div>
          ) : isSuccess ? (
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
            {blocked
              ? "Deposit Suspended"
              : isSuccess
              ? "Deposit Successful"
              : isFailed
              ? "Deposit Failed"
              : "Deposit Pending"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
            {blocked
              ? "Compliance holding process active"
              : isSuccess
              ? "Your funds have been credited to your wallet"
              : isFailed
              ? "We could not process this payment request"
              : isMomo
              ? "Complete the network approval prompt on your phone"
              : "Awaiting wire confirmation from Vaulta settlement"}
          </p>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4"
        >
          {/* Amount Card */}
          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] shadow-xl text-center relative overflow-hidden">
            <CardHeader className="pb-4">
              <CardDescription className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Amount
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-1 text-[#0C0F14] dark:text-white tracking-tight">
                GH₵ {parseFloat(depositData.amount).toFixed(2)}
              </CardTitle>
              <div className="mt-2 flex justify-center">
                <Badge variant="outline" className="text-xs border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-md">
                  {depositData.methodName}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Details Table */}
          <Card className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Reference code</span>
                <span className="text-[#0C0F14] dark:text-white font-mono font-medium">{depositData.referenceCode}</span>
              </div>

              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Payment status</span>
                {blocked ? (
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-md">
                    Compliance Hold
                  </Badge>
                ) : isSuccess ? (
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

              {depositData.phone && (
                <div className="p-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payment wallet</span>
                  <span className="text-[#0C0F14] dark:text-white font-mono">{depositData.phone} ({depositData.providerName})</span>
                </div>
              )}

              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Processing speed</span>
                <span className="text-[#0C0F14] dark:text-white font-medium">
                  {blocked
                    ? "Suspended"
                    : isSuccess
                    ? "Completed"
                    : isMomo
                    ? "Instant (typically < 1 min)"
                    : "2-3 business days"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic feedback from paystack */}
          {depositData.displayText && !blocked && (
            <Alert className="bg-blue-50 dark:bg-blue-500/[0.02] border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl p-5">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-sm font-semibold">Gateway Feedback</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1 text-blue-700/80 dark:text-blue-300/80">
                {depositData.displayText}
              </AlertDescription>
            </Alert>
          )}

          {/* Guide Box */}
          {!blocked && !isSuccess && !isFailed && (
            <Alert className="bg-emerald-50 dark:bg-emerald-500/[0.02] border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl p-5">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-sm font-semibold">Next Steps</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1 text-gray-500 dark:text-gray-400">
                <ul className="space-y-1.5 list-disc pl-3.5">
                  <li>Keep your mobile phone close by to approve the prompt.</li>
                  <li>Funds will be automatically credited to your balance upon authorization.</li>
                  <li>You can monitor the status of this transfer in your dashboard account logs.</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Footer CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-8 space-y-3"
        >
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#0D4F3C]/10 flex items-center justify-center gap-2"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>

          {(!blocked && !isSuccess && !isFailed) && (
            <Button
              onClick={() =>
                router.push(
                  "/deposit/instructions?data=" + searchParams.get("data")
                )
              }
              variant="outline"
              className="w-full bg-transparent border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0C0F14] dark:hover:text-white py-6 rounded-xl transition-all duration-300"
            >
              View details & instructions
            </Button>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function DepositStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
        </div>
      }
    >
      <DepositStatusContent />
    </Suspense>
  );
}
