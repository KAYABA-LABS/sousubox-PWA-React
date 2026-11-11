"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function ManageLimitsPage() {
  const router = useRouter();
  const [limits, setLimits] = useState({
    dailyTransaction: 5000,
    monthlyTransaction: 50000,
    dailyWithdrawal: 1000,
    monthlyWithdrawal: 10000,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header className="bg-sb-canvas px-5 pt-6 pb-4 border-b border-sb-line">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-sb-ink">Limits</h1>
            <p className="text-sm text-sb-ink-2">Manage transaction limits</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Transaction Limits */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">
              Transaction limits
            </h2>
            <div className="space-y-4">
              {/* Daily Transaction */}
              <div className="bg-sb-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sb-ink font-medium">
                      Daily transaction limit
                    </p>
                    <p className="text-xs text-sb-ink-3">Maximum per day</p>
                  </div>
                  <p className="text-2xl font-bold text-sb-ink">
                    ${limits.dailyTransaction.toLocaleString()}
                  </p>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={limits.dailyTransaction}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      dailyTransaction: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-sb-brand-600"
                />
                <div className="flex justify-between text-xs text-sb-ink-3 mt-2">
                  <span>$1,000</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Monthly Transaction */}
              <div className="bg-sb-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sb-ink font-medium">
                      Monthly transaction limit
                    </p>
                    <p className="text-xs text-sb-ink-3">Maximum per month</p>
                  </div>
                  <p className="text-2xl font-bold text-sb-ink">
                    ${limits.monthlyTransaction.toLocaleString()}
                  </p>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={limits.monthlyTransaction}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      monthlyTransaction: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-sb-brand-600"
                />
                <div className="flex justify-between text-xs text-sb-ink-3 mt-2">
                  <span>$10,000</span>
                  <span>$100,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Limits */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">
              Withdrawal limits
            </h2>
            <div className="space-y-4">
              {/* Daily Withdrawal */}
              <div className="bg-sb-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sb-ink font-medium">
                      Daily withdrawal limit
                    </p>
                    <p className="text-xs text-sb-ink-3">ATM and transfers</p>
                  </div>
                  <p className="text-2xl font-bold text-sb-ink">
                    ${limits.dailyWithdrawal.toLocaleString()}
                  </p>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={limits.dailyWithdrawal}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      dailyWithdrawal: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-sb-brand-600"
                />
                <div className="flex justify-between text-xs text-sb-ink-3 mt-2">
                  <span>$500</span>
                  <span>$5,000</span>
                </div>
              </div>

              {/* Monthly Withdrawal */}
              <div className="bg-sb-surface rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sb-ink font-medium">
                      Monthly withdrawal limit
                    </p>
                    <p className="text-xs text-sb-ink-3">All withdrawals</p>
                  </div>
                  <p className="text-2xl font-bold text-sb-ink">
                    ${limits.monthlyWithdrawal.toLocaleString()}
                  </p>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="2500"
                  value={limits.monthlyWithdrawal}
                  onChange={(e) =>
                    setLimits({
                      ...limits,
                      monthlyWithdrawal: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-sb-brand-600"
                />
                <div className="flex justify-between text-xs text-sb-ink-3 mt-2">
                  <span>$5,000</span>
                  <span>$50,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">
                Limit adjustments
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Changes to limits may take up to 24 hours to take effect. Higher
                limits may require additional verification.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-sb-brand-800 hover:bg-sb-brand-700 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Update limits</span>
          )}
        </button>
      </div>
    </div>
  );
}
