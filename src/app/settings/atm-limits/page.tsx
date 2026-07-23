"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ATMLimits() {
  const router = useRouter();
  const [daily, setDaily] = useState("500");

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
        <h1 className="text-2xl font-bold text-white mb-6">
          ATM Withdrawal Limits
        </h1>
        <div className="bg-[#151A1F] rounded-2xl p-4 mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            Daily Withdrawal Limit
          </label>
          <div className="flex items-center gap-2">
            <span className="text-white text-xl">$</span>
            <input
              type="number"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              className="flex-1 bg-[#0C0F14] rounded-xl p-3 text-white"
            />
          </div>
        </div>
        <button className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055]">
          Save Limit
        </button>
      </div>
    </div>
  );
}
