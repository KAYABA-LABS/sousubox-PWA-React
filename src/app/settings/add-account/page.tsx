"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark, Shield, Loader2 } from "lucide-react";

export default function AddBankAccount() {
  const router = useRouter();
  const [method, setMethod] = useState<"instant" | "manual">("instant");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleInstantConnect = () => {
    setIsConnecting(true);
    // Simulate Plaid connection
    setTimeout(() => {
      router.push("/settings/linked-accounts");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings/linked-accounts")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Linked Accounts</span>
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Add Bank Account</h1>
        <p className="text-gray-400 mb-6">
          Connect your bank to enable instant transfers
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMethod("instant")}
            className={`p-4 rounded-xl border-2 transition-all ${
              method === "instant"
                ? "border-[#00E660] bg-[#00E660]/10"
                : "border-white/10 bg-[#151A1F]"
            }`}
          >
            <Landmark className="w-6 h-6 text-[#00E660] mb-2" />
            <p className="text-white font-medium mb-1">Instant Verify</p>
            <p className="text-xs text-gray-400">Connect via bank login</p>
          </button>

          <button
            onClick={() => setMethod("manual")}
            className={`p-4 rounded-xl border-2 transition-all ${
              method === "manual"
                ? "border-[#00E660] bg-[#00E660]/10"
                : "border-white/10 bg-[#151A1F]"
            }`}
          >
            <Shield className="w-6 h-6 text-[#00E660] mb-2" />
            <p className="text-white font-medium mb-1">Manual Entry</p>
            <p className="text-xs text-gray-400">Enter account details</p>
          </button>
        </div>

        {method === "instant" ? (
          <div className="space-y-4">
            <div className="bg-[#00E660]/10 border border-[#00E660]/20 rounded-2xl p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-[#00E660] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Bank-Level Security
                  </h3>
                  <p className="text-sm text-gray-300">
                    We use Plaid to securely connect your account. We never see
                    or store your login credentials.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstantConnect}
              disabled={isConnecting}
              className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect Bank Account"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#151A1F] rounded-2xl p-4">
              <label className="text-sm text-gray-400 mb-2 block">
                Routing Number
              </label>
              <input
                type="text"
                placeholder="000000000"
                className="w-full bg-[#0C0F14] rounded-xl p-3 text-white border border-white/10 focus:border-[#00E660] focus:outline-none transition-colors"
              />
            </div>

            <div className="bg-[#151A1F] rounded-2xl p-4">
              <label className="text-sm text-gray-400 mb-2 block">
                Account Number
              </label>
              <input
                type="text"
                placeholder="000000000000"
                className="w-full bg-[#0C0F14] rounded-xl p-3 text-white border border-white/10 focus:border-[#00E660] focus:outline-none transition-colors"
              />
            </div>

            <div className="bg-[#151A1F] rounded-2xl p-4">
              <label className="text-sm text-gray-400 mb-2 block">
                Account Type
              </label>
              <select className="w-full bg-[#0C0F14] rounded-xl p-3 text-white border border-white/10 focus:border-[#00E660] focus:outline-none transition-colors">
                <option>Checking</option>
                <option>Savings</option>
              </select>
            </div>

            <button className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055] transition-colors">
              Verify Account
            </button>

            <p className="text-xs text-gray-400 text-center">
              We&apos;ll send micro-deposits to verify your account (1-2 business
              days)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
