"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

export const dynamic = "force-dynamic";

type TransferData = {
  amount?: string;
  fromAccount?: { balance: number; name?: string; account?: string } | null;
  toAccount?: { balance: number; name?: string; account?: string } | null;
  [key: string]: unknown;
};

function TransferConfirmContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }
  }, [userId, isLoaded, user, router]);

  const handleTransfer = async () => {
    // For demo/testing: always show blocked error when this button is pressed.
    setIsProcessing(true);
    setBlocked(true);
    setErrorMsg(
      "Your account has been blocked. This transaction cannot be processed."
    );
    setIsProcessing(false);
    return;
  };

  if (!transferData) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Confirm</h1>
            <p className="text-sm text-gray-400">Review transfer</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
            >
              <p className="text-sm text-red-300">{errorMsg}</p>
            </motion.div>
          )}
          {/* Amount Summary */}
          <div className="bg-[#151A1F] rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Transfer amount</p>
            <p className="text-5xl font-bold text-white mb-1">
              ${parseFloat(transferData.amount ?? "0").toFixed(2)}
            </p>
          </div>

          {/* Transfer Details */}
          <div className="bg-[#151A1F] rounded-xl divide-y divide-white/5">
            {/* From */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">From</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {transferData.fromAccount?.name ?? ""}
                  </p>
                  <p className="text-sm text-gray-400">
                    {transferData.fromAccount?.account ?? ""}
                  </p>
                </div>
                <p className="text-white font-medium">
                  ${(transferData.fromAccount?.balance ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* To */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">To</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {transferData.toAccount?.name ?? ""}
                  </p>
                  <p className="text-sm text-gray-400">
                    {transferData.toAccount?.account ?? ""}
                  </p>
                </div>
                <p className="text-white font-medium">
                  ${(transferData.toAccount?.balance ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Fee */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Transfer fee</p>
              <p className="text-[#00E660] font-medium">Free</p>
            </div>

            {/* Speed */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Transfer speed</p>
              <p className="text-white font-medium">Instant</p>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300">
              Your transfer will be completed instantly
            </p>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Edit transfer</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        {blocked ? (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-sm text-red-300">
              Your account is blocked and this transfer cannot be processed.
              Please contact support for assistance.
            </p>
          </div>
        ) : (
          <button
            onClick={handleTransfer}
            disabled={isProcessing}
            className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <span>Transfer funds</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TransferConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TransferConfirmContent />
    </Suspense>
  );
}
