"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";

export default function TransferPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  // Use dashboard-like defaults to avoid empty UI while fetching real values
  const [balance] = useState<number>(3445780.0);
  const [savingsBalance] = useState<number>(5234.75);
  const [fromAccountIndex, setFromAccountIndex] = useState(0);
  const [toAccountIndex, setToAccountIndex] = useState(1);

  const accounts = [
    {
      id: "deposit",
      name: "Deposit Account",
      balance: balance,
      account: "••••1234",
    },
    {
      id: "savings",
      name: "Savings Account",
      balance: savingsBalance,
      account: "••••5678",
    },
  ];

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, user, router]);

  const handleSwap = () => {
    setFromAccountIndex(toAccountIndex);
    setToAccountIndex(fromAccountIndex);
  };

  const handleContinue = () => {
    const transferData = {
      fromAccount: accounts[fromAccountIndex],
      toAccount: accounts[toAccountIndex],
    };
    router.push(
      `/transfer/amount?data=${encodeURIComponent(
        JSON.stringify(transferData),
      )}`,
    );
  };

  // Can't transfer from account to itself
  const canContinue = fromAccountIndex !== toAccountIndex;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header role="banner" className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">Transfer</h1>
            <p className="text-sm text-gray-400">Between your accounts</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              From
            </label>
            <div className="bg-[#151A1F] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {accounts[fromAccountIndex].name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {accounts[fromAccountIndex].account}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    $
                    {accounts[fromAccountIndex].balance.toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-[#00E660] hover:bg-[#00cc55] flex items-center justify-center transition-all hover:scale-105"
              aria-label="Swap accounts"
            >
              <ArrowRightLeft className="w-5 h-5 text-black" />
            </Button>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              To
            </label>
            <div className="bg-[#151A1F] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {accounts[toAccountIndex].name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {accounts[toAccountIndex].account}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    $
                    {accounts[toAccountIndex].balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300">
              Transfers between your accounts are instant and free
            </p>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </main>
  );
}
