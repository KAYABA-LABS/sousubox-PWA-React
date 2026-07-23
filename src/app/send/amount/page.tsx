"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

function SendAmountContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const recipientParam = searchParams.get("recipient");

  const initialRecipient = useMemo(() => {
    if (!recipientParam) return null;
    try {
      return JSON.parse(recipientParam);
    } catch {
      return null;
    }
  }, [recipientParam]);

  const [recipient] = useState<typeof initialRecipient>(initialRecipient);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance] = useState<number>(0);
  const [currentAccountIndex] = useState(0);

  const accounts = [
    { name: "Deposit Account", balance: balance, account: "••••1234" },
    { name: "Savings Account", balance: 5234.75, account: "••••5678" },
  ];

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
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

  const quickAmounts = [50, 100, 250, 500];

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const canContinue =
    numericAmount > 0 && numericAmount <= accounts[currentAccountIndex].balance;
  const insufficientFunds =
    numericAmount > accounts[currentAccountIndex].balance;

  const handleReview = () => {
    const transferData = {
      recipient,
      amount: displayAmount,
      fromAccount: accounts[currentAccountIndex],
      note,
    };
    router.push(
      `/send/review?data=${encodeURIComponent(JSON.stringify(transferData))}`
    );
  };

  if (!recipient) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header role="banner" className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">Send</h1>
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
          {/* Recipient Card */}
          <div className="bg-[#151A1F] rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00E660] flex items-center justify-center">
              <span className="text-base font-bold text-black">
                {recipient.avatar}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{recipient.name}</p>
              <p className="text-sm text-gray-400">{recipient.email}</p>
            </div>
          </div>

          {/* Amount Input (Hero) */}
          <div className="py-8">
            <div className="text-center">
              <div className="flex items-start justify-center gap-2">
                <span className="text-4xl font-light text-gray-400 mt-2">
                  $
                </span>
                <Input
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
                <Button
                  key={quickAmount}
                  onClick={() => setAmount((quickAmount * 100).toString())}
                  className="px-4 py-2 bg-[#151A1F] hover:bg-[#1A1F25] text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* From Account Selector */}
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
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Available balance: $
              {accounts[currentAccountIndex].balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="What's this for?"
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
        <Button
          onClick={handleReview}
          disabled={!canContinue}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Review transfer
        </Button>
      </div>
    </main>
  );
}

export default function SendAmountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SendAmountContent />
    </Suspense>
  );
}
