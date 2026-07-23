"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark, CreditCard } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";

const depositMethods = [
  {
    id: "momo",
    name: "Mobile Money",
    description: "MTN, Vodafone, AirtelTigo",
    icon: CreditCard,
    processingTime: "Instant",
  },
  {
    id: "bank",
    name: "Bank transfer",
    description: "Link your bank account",
    icon: Landmark,
    processingTime: "2-3 business days",
  },
  {
    id: "card",
    name: "Debit card",
    description: "Instant with card",
    icon: CreditCard,
    processingTime: "Instant",
  },
];

export default function DepositPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [balance] = useState<number>(0);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, user, router]);

  const handleMethodSelect = (methodId: string) => {
    router.push(`/deposit/amount?method=${methodId}`);
  };

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
            <h1 className="text-xl font-semibold text-white">Deposit</h1>
            <p className="text-sm text-gray-400">Add funds to your account</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Balance */}
          <div className="bg-[#151A1F] rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400 mb-1">Current balance</p>
            <p className="text-3xl font-bold text-white">
              $
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Deposit Methods */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">
              Choose deposit method
            </h2>
            <div className="space-y-3">
              {depositMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-full bg-[#151A1F] hover:bg-[#1A1F25] rounded-xl p-4 flex items-center gap-4 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#00E660]/10 flex items-center justify-center shrink-0">
                      <Icon
                        className="w-6 h-6 text-[#00E660]"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium mb-0.5">
                        {method.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {method.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {method.processingTime}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300 mb-2 font-medium">
              Withdrawal requirements
            </p>
            <p className="text-xs text-blue-300/80">
              A minimum deposit of $350.00 is required before you can make
              withdrawals from your account
            </p>
          </div>
        </motion.div>
      </main>
    </main>
  );
}
