"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ATMLimits() {
  const router = useRouter();
  const [daily, setDaily] = useState("500");

  return (
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-sb-ink mb-6">
          ATM Withdrawal Limits
        </h1>
        <div className="bg-sb-surface rounded-2xl p-4 mb-4">
          <label className="text-sm text-sb-ink-2 mb-2 block">
            Daily Withdrawal Limit
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sb-ink text-xl">$</span>
            <input
              type="number"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
            />
          </div>
        </div>
        <button className="w-full bg-sb-brand-800 text-white font-medium py-3 rounded-xl hover:bg-sb-brand-700">
          Save Limit
        </button>
      </div>
    </div>
  );
}
