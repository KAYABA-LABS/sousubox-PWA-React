"use client";

import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { api, type FundingSource } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { getNetworkLabel, maskLast4, extractLast4 } from "@/lib/momo";
import { usePoolService } from "@/services/poolService";
import { useSavingsService } from "@/services/savingsService";
import { useUserService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const dynamic = "force-dynamic";

const QUICK_PERCENTAGES = [25, 50, 75, 100];

function WithdrawAmountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const poolService = usePoolService();
  const savingsService = useSavingsService();
  const userService = useUserService();

  const networkId = searchParams.get("networkId") || "";
  const phoneNumber = searchParams.get("phoneNumber") || "";

  const [isLoadingSource, setIsLoadingSource] = useState(true);
  const [fundingSource, setFundingSource] = useState<FundingSource | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referenceCode] = useState(() => `WDR${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const loadData = async () => {
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

        const match = sources.find(
          (source) => source.networkId === networkId && source.phoneNumber === phoneNumber
        );
        if (!match) {
          setNotFound(true);
        } else {
          setFundingSource(match);
        }
      } catch (error) {
        console.error("Failed to load withdrawal destination:", error);
        setNotFound(true);
      } finally {
        setIsLoadingSource(false);
      }
    };

    loadData();
    // poolService/savingsService are re-created every render (not memoized) — omitted
    // from deps to avoid a fetch loop, matching ClientDashboard.tsx's same pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId, user, router, networkId, phoneNumber]);

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? (parseInt(numericValue, 10) / 100).toFixed(2) : "";
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 8) setAmount(numericValue);
  };

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const exceedsBalance = numericAmount > availableBalance;
  const canContinue = numericAmount > 0 && !exceedsBalance && !!fundingSource;

  const handleQuickPercentage = (percentage: number) => {
    const value = (availableBalance * percentage) / 100;
    setAmount(Math.round(value * 100).toString());
  };

  const handleConfirmWithdrawal = async () => {
    if (!fundingSource || !userId) {
      setErrorMessage("No withdrawal destination was found.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await api.requestWithdrawal(userId, {
        amount: numericAmount,
        fundingSource: {
          networkId: fundingSource.networkId,
          phoneNumber: fundingSource.phoneNumber,
        },
        metadata: { referenceCode },
      });

      if (!response.success) {
        throw new Error(response.message || response.error || "Failed to submit withdrawal request.");
      }

      const result = (response.data || {}) as {
        reference?: string;
        status?: string;
        display_text?: string;
        message?: string;
      };

      setShowConfirm(false);
      router.push(`/withdraw/status?data=${encodeURIComponent(JSON.stringify({
        amount: displayAmount,
        referenceCode: result.reference || referenceCode,
        status: result.status || "pending",
        displayText: result.display_text || result.message,
        networkLabel: getNetworkLabel(fundingSource.networkId),
        phone: fundingSource.phoneNumber,
      }))}`);
    } catch (error) {
      setShowConfirm(false);
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit withdrawal request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSource) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  if (notFound || !fundingSource) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-[#0C0F14] dark:text-white font-medium">
          We couldn&apos;t find that withdrawal destination.
        </p>
        <Button onClick={() => router.push("/withdraw")} className="bg-[#0D4F3C] hover:bg-[#156B53] text-white">
          Choose a destination
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Withdraw</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter amount</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0D4F3C]/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-[#0D4F3C] dark:text-[#156B53]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium">{getNetworkLabel(fundingSource.networkId)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {maskLast4(extractLast4(fundingSource.phoneNumber))}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="py-8">
            <div className="text-center">
              <div className="flex items-start justify-center gap-2">
                <span className="text-4xl font-light text-gray-500 mt-2">₵</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  className="text-6xl font-bold bg-transparent border-none outline-none text-center w-auto min-w-50"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Available: GH₵ {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-2 justify-center mt-6">
              {QUICK_PERCENTAGES.map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleQuickPercentage(percentage)}
                  className="px-4 py-2 bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {percentage === 100 ? "Max" : `${percentage}%`}
                </button>
              ))}
            </div>
          </div>

          {exceedsBalance && numericAmount > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Insufficient balance</AlertTitle>
              <AlertDescription>
                You can withdraw up to GH₵ {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Withdrawal error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!canContinue}
            className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl"
          >
            Review withdrawal
          </Button>
        </motion.div>
      </main>

      <AlertDialog open={showConfirm} onOpenChange={(open) => !isSubmitting && setShowConfirm(open)}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">Confirm withdrawal</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              You&apos;re about to withdraw{" "}
              <span className="text-[#0C0F14] dark:text-white font-semibold">GH₵ {numericAmount.toFixed(2)}</span>{" "}
              to{" "}
              <span className="text-[#0C0F14] dark:text-white font-medium">
                {getNetworkLabel(fundingSource.networkId)} {maskLast4(extractLast4(fundingSource.phoneNumber))}
              </span>
              . This cannot be undone once processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0C0F14] dark:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmWithdrawal();
              }}
              disabled={isSubmitting}
              className="bg-[#0D4F3C] hover:bg-[#156B53] text-white"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Confirm withdrawal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function WithdrawAmountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C]" /></div>}>
      <WithdrawAmountContent />
    </Suspense>
  );
}
