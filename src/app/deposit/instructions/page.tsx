"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface DepositData {
  method: string;
  methodName: string;
  amount: string;
}

function DepositInstructionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [referenceCode] = useState(
    () => `DEP${Date.now().toString().slice(-8)}`
  );

  const depositData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as DepositData) : null;
  }, [searchParams]);

  const accountDetails = {
    accountName: "Vaulta Mobile Banking",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    bankName: "First National Bank",
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleComplete = () => {
    // Force blocked status when completing deposit (demo/testing)
    router.push(
      `/deposit/status?data=${encodeURIComponent(
        JSON.stringify({ ...depositData, referenceCode })
      )}&force_blocked=1`
    );
  };

  if (!depositData) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
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
            <h1 className="text-xl font-semibold text-white">Instructions</h1>
            <p className="text-sm text-gray-400">Follow these steps</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Amount Summary */}
          <div className="bg-[#151A1F] rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400 mb-1">Deposit amount</p>
            <p className="text-4xl font-bold text-white mb-2">
              ${parseFloat(depositData.amount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              via {depositData.methodName}
            </p>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">
              Step-by-step instructions
            </h2>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-[#151A1F] rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00E660] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-black">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      Copy the reference code
                    </p>
                    <p className="text-sm text-gray-400 mb-3">
                      Include this code in your transfer memo
                    </p>
                    <button
                      onClick={() => handleCopy("reference", referenceCode)}
                      className="w-full bg-[#0C0F14] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:bg-[#151A1F] transition-colors"
                    >
                      <span className="text-white font-mono">
                        {referenceCode}
                      </span>
                      {copiedField === "reference" ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00E660]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#151A1F] rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00E660] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-black">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      Transfer to this account
                    </p>
                    <p className="text-sm text-gray-400 mb-3">
                      Use these details for your bank transfer
                    </p>
                    <div className="space-y-2">
                      {/* Account Name */}
                      <button
                        onClick={() =>
                          handleCopy("accountName", accountDetails.accountName)
                        }
                        className="w-full bg-[#0C0F14] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:bg-[#151A1F] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-xs text-gray-500">Account name</p>
                          <p className="text-white">
                            {accountDetails.accountName}
                          </p>
                        </div>
                        {copiedField === "accountName" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00E660]" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                        )}
                      </button>

                      {/* Account Number */}
                      <button
                        onClick={() =>
                          handleCopy(
                            "accountNumber",
                            accountDetails.accountNumber
                          )
                        }
                        className="w-full bg-[#0C0F14] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:bg-[#151A1F] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-xs text-gray-500">
                            Account number
                          </p>
                          <p className="text-white font-mono">
                            {accountDetails.accountNumber}
                          </p>
                        </div>
                        {copiedField === "accountNumber" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00E660]" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                        )}
                      </button>

                      {/* Routing Number */}
                      <button
                        onClick={() =>
                          handleCopy(
                            "routingNumber",
                            accountDetails.routingNumber
                          )
                        }
                        className="w-full bg-[#0C0F14] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:bg-[#151A1F] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-xs text-gray-500">
                            Routing number
                          </p>
                          <p className="text-white font-mono">
                            {accountDetails.routingNumber}
                          </p>
                        </div>
                        {copiedField === "routingNumber" ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00E660]" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                        )}
                      </button>

                      {/* Bank Name */}
                      <div className="w-full bg-[#0C0F14] border border-white/10 rounded-lg px-4 py-3">
                        <p className="text-xs text-gray-500">Bank name</p>
                        <p className="text-white">{accountDetails.bankName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#151A1F] rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00E660] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-black">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      Wait for confirmation
                    </p>
                    <p className="text-sm text-gray-400">
                      Your deposit will be processed within 2-3 business days.
                      You&apos;ll receive a notification once it&apos;s
                      complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-amber-300 font-medium mb-1">Important</p>
            <p className="text-xs text-amber-300/80">
              Make sure to include the reference code in your transfer. Without
              it, we may not be able to credit your account automatically.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleComplete}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] text-black font-semibold py-4 rounded-xl transition-colors"
        >
          I&apos;ve completed the deposit
        </button>
      </div>
    </div>
  );
}

export default function DepositInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DepositInstructionsContent />
    </Suspense>
  );
}
