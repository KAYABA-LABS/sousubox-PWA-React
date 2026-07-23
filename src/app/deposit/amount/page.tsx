"use client";

import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Landmark, CreditCard, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const methodData: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  bank: { name: "Bank transfer", icon: Landmark },
  card: { name: "Debit card", icon: CreditCard },
  manual: { name: "Manual deposit", icon: FileText },
};

function DepositAmountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const methodId = searchParams.get("method") || "bank";
  const method = methodData[methodId];

  const [amount, setAmount] = useState("");

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

  const quickAmounts = [100, 250, 500, 1000];

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const canContinue = numericAmount > 0;
  const meetsMinimum = numericAmount >= 350;

  const handleContinue = () => {
    const depositData = {
      method: methodId,
      methodName: method.name,
      amount: displayAmount,
    };
    router.push(
      `/deposit/instructions?data=${encodeURIComponent(
        JSON.stringify(depositData)
      )}`
    );
  };

  const Icon = method.icon;

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Deposit</h1>
            <p className="text-sm text-gray-400">Enter amount</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 flex-1"
        >
          {/* Method Card */}
          <div className="bg-[#151A1F] rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00E660]/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#00E660]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-medium">{method.name}</p>
              <p className="text-sm text-gray-400">Deposit method</p>
            </div>
          </div>

          {/* Amount Input (Hero) */}
          <div className="py-8">
            <div className="text-center">
              <div className="flex items-start justify-center gap-2">
                <span className="text-4xl font-light text-gray-400 mt-2">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={(e) =>
                    handleAmountChange(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="text-6xl font-bold text-white bg-transparent border-none outline-none text-center w-auto min-w-50"
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
                  className="px-4 py-2 bg-[#151A1F] hover:bg-[#1A1F25] text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Info Notices */}
          {!meetsMinimum && numericAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
            >
              <p className="text-sm text-amber-300 font-medium mb-1">
                Minimum deposit required
              </p>
              <p className="text-xs text-amber-300/80">
                A minimum deposit of $350.00 is required to unlock withdrawals
              </p>
            </motion.div>
          )}

          {meetsMinimum && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#00E660]/10 border border-[#00E660]/20 rounded-xl p-4"
            >
              <p className="text-sm text-[#00E660]">
                ✓ This deposit will unlock withdrawal functionality
              </p>
            </motion.div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300">
              Processing time varies by method. Funds will be available once the
              deposit is confirmed.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function DepositAmountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DepositAmountContent />
    </Suspense>
  );
}
