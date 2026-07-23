"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TransferLimits() {
  const router = useRouter();
  const [perTransfer, setPerTransfer] = useState("5000");
  const [dailyTotal, setDailyTotal] = useState("10000");

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
        <h1 className="text-2xl font-bold text-white mb-6">Transfer Limits</h1>
        <div className="space-y-4">
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Per Transfer Limit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">$</span>
              <input
                type="number"
                value={perTransfer}
                onChange={(e) => setPerTransfer(e.target.value)}
                className="flex-1 bg-[#0C0F14] rounded-xl p-3 text-white"
              />
            </div>
          </div>
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Daily Total Limit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">$</span>
              <input
                type="number"
                value={dailyTotal}
                onChange={(e) => setDailyTotal(e.target.value)}
                className="flex-1 bg-[#0C0F14] rounded-xl p-3 text-white"
              />
            </div>
          </div>
          <button className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055]">
            Save Limits
          </button>
        </div>
      </div>
    </div>
  );
}
