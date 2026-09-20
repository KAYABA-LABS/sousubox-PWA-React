"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type TransferData = {
  fromAccount?: { name?: string; account?: string; balance?: number } | null;
  toAccount?: { name?: string; account?: string } | null;
  [key: string]: unknown;
};

function TransferAmountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const initialTransferData = useMemo<TransferData | null>(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(dataParam) as TransferData;
    } catch {
      return null;
    }
  }, [dataParam]);

  const [transferData] = useState<TransferData | null>(initialTransferData);
  const [amount, setAmount] = useState("");

  // Derived available balance with safe default
  const availableBalance = transferData?.fromAccount?.balance ?? 0;

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    const number = parseInt(numericValue) / 100;
    return number.toFixed(2);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 8) {
      setAmount(numericValue);
    }
  };

  const quickAmounts = [50, 100, 500, 1000];

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const canContinue = numericAmount > 0 && numericAmount <= availableBalance;
  const insufficientFunds = numericAmount > availableBalance;

  const handleReview = () => {
    const finalData = {
      ...transferData,
      amount: displayAmount,
    };
    router.push(
      `/transfer/confirm?data=${encodeURIComponent(JSON.stringify(finalData))}`
    );
  };

  if (!transferData) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Transfer</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter amount</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 flex-1"
        >
          {/* Transfer Direction Card */}
          <div className="bg-white dark:bg-[#151A1F] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">From</p>
              <p className="text-[#0C0F14] dark:text-white font-medium">
                {transferData?.fromAccount?.name ?? ""}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transferData?.fromAccount?.account ?? ""}
              </p>
            </div>
            <div className="h-px bg-black/10 dark:bg-white/10" />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">To</p>
              <p className="text-[#0C0F14] dark:text-white font-medium">
                {transferData?.toAccount?.name ?? ""}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transferData?.toAccount?.account ?? ""}
              </p>
            </div>
          </div>

          {/* Amount Input (Hero) */}
          <div className="py-8">
            <div className="text-center">
              <div className="flex items-start justify-center gap-2">
                <span className="text-4xl font-light text-gray-500 dark:text-gray-400 mt-2">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={(e) =>
                    handleAmountChange(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="text-6xl font-bold text-[#0C0F14] dark:text-white bg-transparent border-none outline-none text-center w-auto min-w-50"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 justify-center mt-6">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount((quickAmount * 100).toString())}
                  className="px-4 py-2 bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>

            {/* Balance Hint */}
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
              Available: $
              {availableBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Insufficient Funds Warning */}
          {insufficientFunds && numericAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 rounded-xl p-4"
            >
              <p className="text-sm text-red-600 dark:text-red-400">
                Insufficient funds. Your available balance is $
                {availableBalance.toFixed(2)}
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleReview}
          disabled={!canContinue}
          className="w-full bg-[#0D4F3C] hover:bg-[#156B53] disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Review transfer
        </button>
      </div>
    </div>
  );
}

export default function TransferAmountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TransferAmountContent />
    </Suspense>
  );
}
