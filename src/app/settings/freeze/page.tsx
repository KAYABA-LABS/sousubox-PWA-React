"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Snowflake, AlertCircle, CheckCircle2 } from "lucide-react";

export default function FreezeCard() {
  const router = useRouter();
  const [isFrozen, setIsFrozen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Freeze Card</h1>

        <div
          className={`rounded-2xl p-6 mb-6 ${
            isFrozen
              ? "bg-blue-500/10 border border-blue-500/20"
              : "bg-[#151A1F]"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isFrozen ? "bg-blue-500/20" : "bg-white/5"
              }`}
            >
              <Snowflake
                className={`w-6 h-6 ${
                  isFrozen ? "text-blue-400" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {isFrozen ? "Card is Frozen" : "Card is Active"}
              </h2>
              <p className="text-sm text-gray-400">
                {isFrozen
                  ? "All transactions are blocked"
                  : "You can make transactions"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFrozen(!isFrozen)}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              isFrozen
                ? "bg-[#00E660] text-black hover:bg-[#00D055]"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isFrozen ? "Unfreeze Card" : "Freeze Card"}
          </button>
        </div>

        <div className="bg-[#151A1F] rounded-2xl p-5 space-y-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">
                What happens when frozen?
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• All card transactions will be declined</li>
                <li>• Online and in-store purchases blocked</li>
                <li>• ATM withdrawals disabled</li>
                <li>• Recurring payments may fail</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#151A1F] rounded-2xl p-5 mt-3">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00E660] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">
                Instant Protection
              </h3>
              <p className="text-sm text-gray-400">
                Freeze and unfreeze your card instantly if you misplace it. Your
                card details remain the same.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
