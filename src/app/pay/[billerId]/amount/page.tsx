"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

type Biller = { name: string; logo: string };
const billersData: Record<string, Biller> = {
  "1": { name: "Electric Company", logo: "⚡" },
  "2": { name: "Internet Provider", logo: "🌐" },
  "3": { name: "Mobile Carrier", logo: "📱" },
};

export default function PayAmountPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const params = useParams();
  const billerId = params.billerId as string;
  const biller = billersData[billerId];

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance] = useState<number>(0);
  const [currentAccountIndex] = useState(0);

  const [pendingDeposit] = useState<number>(() => {
    try {
      if (typeof window === "undefined") return 0;
      const p = sessionStorage.getItem("pending_deposit");
      return p ? parseFloat(p) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // displayBalance mirrors the dashboard: profile balance + any pending deposit
  const displayBalance = balance + pendingDeposit;

  const accounts = [
    { name: "Deposit Account", balance: displayBalance, account: "••••1234" },
    { name: "Savings Account", balance: 5234.75, account: "••••5678" },
  ];

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, user, router]);

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

  const quickAmounts = [50, 100, 200, 500];

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const canContinue =
    numericAmount > 0 && numericAmount <= accounts[currentAccountIndex].balance;
  const insufficientFunds =
    numericAmount > accounts[currentAccountIndex].balance;

  const handleContinue = () => {
    const paymentData = {
      biller,
      billerId,
      amount: displayAmount,
      fromAccount: accounts[currentAccountIndex],
      note,
    };
    router.push(
      `/pay/${billerId}/schedule?data=${encodeURIComponent(
        JSON.stringify(paymentData),
      )}`,
    );
  };

  if (!biller) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-400">Biller not found</p>
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
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Pay</h1>
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
          {/* Biller Card */}
          <div className="bg-[#151A1F] rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00E660]/10 flex items-center justify-center">
              <span className="text-2xl">{biller.logo}</span>
            </div>
            <div>
              <p className="text-white font-medium">{biller.name}</p>
              <p className="text-sm text-gray-400">Bill payment</p>
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

          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              From account
            </label>
            <div className="bg-[#151A1F] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {accounts[currentAccountIndex].name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {accounts[currentAccountIndex].account}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    $
                    {accounts[currentAccountIndex].balance.toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#151A1F] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E660] transition-colors"
            />
          </div>

          {/* Insufficient Funds Warning */}
          {insufficientFunds && numericAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <p className="text-sm text-red-400">
                Insufficient funds. Your available balance is $
                {accounts[currentAccountIndex].balance.toFixed(2)}
              </p>
            </motion.div>
          )}
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
