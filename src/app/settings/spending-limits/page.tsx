"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SpendingLimits() {
  const router = useRouter();
  const [dailyLimit, setDailyLimit] = useState("1000");
  const [weeklyLimit, setWeeklyLimit] = useState("5000");
  const [monthlyLimit, setMonthlyLimit] = useState("20000");

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
        <h1 className="text-2xl font-bold text-white mb-2">Spending Limits</h1>
        <p className="text-gray-400 mb-6">
          Set daily, weekly, and monthly spending limits
        </p>
        <div className="space-y-4">
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Daily Limit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">$</span>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="flex-1 bg-[#0C0F14] rounded-xl p-3 text-white"
              />
            </div>
          </div>
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Weekly Limit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">$</span>
              <input
                type="number"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                className="flex-1 bg-[#0C0F14] rounded-xl p-3 text-white"
              />
            </div>
          </div>
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Monthly Limit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">$</span>
              <input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
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
