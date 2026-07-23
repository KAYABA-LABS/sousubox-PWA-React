"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Ban } from "lucide-react";

export default function BlockedMerchants() {
  const router = useRouter();
  const blocked = [
    { name: "Example Casino", since: "Dec 2025" },
    { name: "Sample Bar", since: "Jan 2026" },
  ];

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Blocked Merchants</h1>
          <button className="flex items-center gap-2 bg-[#00E660] text-black px-4 py-2 rounded-xl font-medium hover:bg-[#00D055]">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {blocked.map((merchant, i) => (
            <div
              key={i}
              className="bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <Ban className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-white font-medium">{merchant.name}</h3>
                  <p className="text-xs text-gray-400">
                    Blocked since {merchant.since}
                  </p>
                </div>
              </div>
              <button className="text-[#00E660] text-sm">Unblock</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
