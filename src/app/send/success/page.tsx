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
      <div className="min-h-screen bg-sb-canvas flex items-center justify-center">
        <p className="text-sb-ink-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header className="bg-sb-canvas px-5 pt-6 pb-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
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
          <div className="w-24 h-24 rounded-full bg-sb-brand-800/20 dark:bg-sb-brand-700/20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle2
                className="w-14 h-14 text-sb-brand-600"
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
          <h1 className="text-3xl font-bold text-sb-ink mb-2">Transfer sent</h1>
          <p className="text-sb-ink-2">Your money is on its way</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-4"
        >
          {/* Amount Card */}
          <div className="bg-sb-surface rounded-xl p-6 text-center">
            <p className="text-5xl font-bold text-sb-ink mb-4">
              ${parseFloat(transferData.amount ?? "0").toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sb-brand-800 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {transferData.recipient?.avatar ?? ""}
                </span>
              </div>
              <p className="text-sb-ink-2">
                to {transferData.recipient?.name ?? ""}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-sb-surface rounded-xl divide-y divide-black/5 dark:divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-sb-ink-2">Transaction ID</p>
              <p className="text-sb-ink font-mono text-sm">
                {transferData.transactionId}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-sb-ink-2">Date & Time</p>
              <p className="text-sb-ink text-sm">
                {formatDate(transferData.timestamp)}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-sb-ink-2">Status</p>
              <span className="px-3 py-1 bg-sb-brand-800/20 dark:bg-sb-brand-700/20 text-sb-brand-600 rounded-full text-xs font-medium">
                Completed
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {}}
              className="flex-1 bg-sb-surface hover:bg-gray-50 dark:hover:bg-sb-surface-2 text-sb-ink py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button
              onClick={() => {}}
              className="flex-1 bg-sb-surface hover:bg-gray-50 dark:hover:bg-sb-surface-2 text-sb-ink py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
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
          className="w-full bg-sb-brand-800 hover:bg-sb-brand-700 text-white font-semibold py-4 rounded-xl transition-colors"
        >
          View transaction
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-transparent border border-sb-line hover:bg-black/5 dark:hover:bg-white/5 text-sb-ink font-medium py-4 rounded-xl transition-colors"
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
        <div className="min-h-screen bg-sb-canvas flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sb-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SendSuccessContent />
    </Suspense>
  );
}
