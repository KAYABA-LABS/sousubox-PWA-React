"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, DollarSign } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

export const dynamic = "force-dynamic";

function ScanResultContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const parsedQr = useMemo(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(dataParam));
    } catch {
      return null;
    }
  }, [dataParam]);

  const [amount, setAmount] = useState<string>(
    parsedQr && parsedQr.amount ? String(parsedQr.amount) : ""
  );
  const [recipientName] = useState<string>((parsedQr && parsedQr.name) || "");
  const [recipientType] = useState<"person" | "merchant">(
    (parsedQr && parsedQr.type) || "person"
  );
  const [balance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, user, router]);

  const handlePay = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (paymentAmount > balance) {
      router.push("/deposit?reason=insufficient");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      router.push(
        `/send/success?amount=${paymentAmount}&recipient=${recipientName}`
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col pb-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[#151A1F] hover:bg-[#1A1F25] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-semibold text-white">Confirm Payment</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Recipient Card */}
          <div className="bg-[#151A1F] rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#00E660]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#00E660]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Paying to</p>
                <p className="text-lg font-semibold text-white">
                  {recipientName}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Type
              </p>
              <p className="text-sm text-white capitalize">{recipientType}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-[#151A1F] rounded-3xl p-6">
            <label className="text-sm text-gray-400 mb-3 block">Amount</label>
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-3xl font-bold text-white focus:outline-none"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Account Balance */}
          <div className="bg-[#151A1F] rounded-3xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">From Account</span>
              <span className="text-sm font-medium text-white">
                Deposit Account
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Available Balance</span>
              <span className="text-sm font-medium text-white">
                $
                {balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Warning if insufficient */}
          {parseFloat(amount) > balance && amount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
            >
              <p className="text-sm text-red-500">
                Insufficient balance. Please deposit funds or enter a smaller
                amount.
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 space-y-3"
      >
        <button
          onClick={handlePay}
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full bg-[#00E660] hover:bg-[#00E660]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay $${amount || "0.00"}`
          )}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full bg-[#151A1F] hover:bg-[#1A1F25] text-white font-semibold py-4 rounded-xl transition-all"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

export default function ScanResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ScanResultContent />
    </Suspense>
  );
}
