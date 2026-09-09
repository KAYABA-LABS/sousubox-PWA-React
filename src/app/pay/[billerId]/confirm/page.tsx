"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PaymentData {
  biller: { name: string; logo: string };
  billerId?: string;
  amount: string;
  fromAccount: { name: string; balance: number; account: string };
  timing?: string;
  scheduledDate?: string;
  note?: string;
}

function PayConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const paymentData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as PaymentData) : null;
  }, [searchParams]);

  const handlePay = async () => {
    // For demo/testing: always trigger the blocked error like transfers
    setIsProcessing(true);
    setErrorMsg(
      "Your account has been blocked. This payment cannot be processed."
    );
    setIsProcessing(false);
    return;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const fee = 0.0;
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Confirm</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review payment details</p>
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
              className="mb-2 bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 rounded-xl p-3"
            >
              <p className="text-sm text-red-600 dark:text-red-300">{errorMsg}</p>
            </motion.div>
          )}

          {/* Amount Summary */}
          <div className="bg-white dark:bg-[#151A1F] rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">You&apos;re paying</p>
            <p className="text-5xl font-bold text-[#0C0F14] dark:text-white mb-1">
              ${parseFloat(paymentData.amount).toFixed(2)}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-[#151A1F] rounded-xl divide-y divide-black/5 dark:divide-white/5">
            {/* Biller */}
            <div className="p-4">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">To</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">{paymentData.biller.logo}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[#0C0F14] dark:text-white font-medium">
                    {paymentData.biller.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bill payment</p>
                </div>
              </div>
            </div>

            {/* From Account */}
            <div className="p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">From</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#0C0F14] dark:text-white font-medium">
                    {paymentData.fromAccount.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {paymentData.fromAccount.account}
                  </p>
                </div>
                <p className="text-[#0C0F14] dark:text-white font-medium">
                  ${paymentData.fromAccount.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment Date */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment date</p>
              <p className="text-[#0C0F14] dark:text-white font-medium">
                {paymentData.timing === "now"
                  ? "Today"
                  : formatDate(paymentData.scheduledDate)}
              </p>
            </div>

            {/* Fee */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Processing fee</p>
              <p className="text-[#0C0F14] dark:text-white font-medium">${fee.toFixed(2)}</p>
            </div>

            {/* Note */}
            {paymentData.note && (
              <div className="p-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Note</p>
                <p className="text-[#0C0F14] dark:text-white">{paymentData.note}</p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl p-4 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                Payment confirmation
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Please verify all details before submitting payment.
              </p>
            </div>
          </motion.div>

          {/* Edit Button */}
          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 text-[#0C0F14] dark:text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Edit payment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full bg-[#0D4F3C] hover:bg-[#156B53] disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Pay now</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function PayConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PayConfirmContent />
    </Suspense>
  );
}
