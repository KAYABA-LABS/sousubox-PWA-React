"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Share2, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type TransferData = {
  amount?: string;
  recipient?: { name?: string; avatar?: string } | null;
  transactionId?: string;
  timestamp?: string;
  [key: string]: unknown;
};

function SendSuccessContent() {
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

  const handleViewTransaction = () => {
    if (transferData?.transactionId) {
      router.push(`/transaction/${transferData.transactionId}`);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col items-center justify-center">
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
          <div className="w-24 h-24 rounded-full bg-[#00E660]/20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle2
                className="w-14 h-14 text-[#00E660]"
                strokeWidth={2}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Transfer sent</h1>
          <p className="text-gray-400">Your money is on its way</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-4"
        >
          {/* Amount Card */}
          <div className="bg-[#151A1F] rounded-xl p-6 text-center">
            <p className="text-5xl font-bold text-white mb-4">
              ${parseFloat(transferData.amount ?? "0").toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00E660] flex items-center justify-center">
                <span className="text-xs font-bold text-black">
                  {transferData.recipient?.avatar ?? ""}
                </span>
              </div>
              <p className="text-gray-400">
                to {transferData.recipient?.name ?? ""}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-[#151A1F] rounded-xl divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Transaction ID</p>
              <p className="text-white font-mono text-sm">
                {transferData.transactionId}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Date & Time</p>
              <p className="text-white text-sm">
                {formatDate(transferData.timestamp)}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Status</p>
              <span className="px-3 py-1 bg-[#00E660]/20 text-[#00E660] rounded-full text-xs font-medium">
                Completed
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {}}
              className="flex-1 bg-[#151A1F] hover:bg-[#1A1F25] text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button
              onClick={() => {}}
              className="flex-1 bg-[#151A1F] hover:bg-[#1A1F25] text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Bottom Actions */}
      <div className="px-5 pb-8 space-y-3">
        <button
          onClick={handleViewTransaction}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] text-black font-semibold py-4 rounded-xl transition-colors"
        >
          View transaction
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium py-4 rounded-xl transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default function SendSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SendSuccessContent />
    </Suspense>
  );
}
