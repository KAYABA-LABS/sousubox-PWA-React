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
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-sb-ink">Blocked Merchants</h1>
          <button className="flex items-center gap-2 bg-sb-brand-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-sb-brand-700">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {blocked.map((merchant, i) => (
            <div
              key={i}
              className="bg-sb-surface rounded-2xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <Ban className="w-5 h-5 text-red-500 dark:text-red-400" />
                <div>
                  <h3 className="text-sb-ink font-medium">{merchant.name}</h3>
                  <p className="text-xs text-sb-ink-2">
                    Blocked since {merchant.since}
                  </p>
                </div>
              </div>
              <button className="text-sb-brand-600 text-sm">Unblock</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
