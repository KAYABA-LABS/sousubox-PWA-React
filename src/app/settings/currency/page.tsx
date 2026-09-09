"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

export default function CurrencySettings() {
  const router = useRouter();
  const [selected, setSelected] = useState("USD");
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">Currency</h1>
        <div className="space-y-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelected(curr.code)}
              className={`w-full bg-white dark:bg-[#151A1F] rounded-xl p-4 flex justify-between items-center transition-colors ${
                selected === curr.code
                  ? "ring-2 ring-[#0D4F3C] dark:ring-[#156B53]"
                  : "hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{curr.symbol}</span>
                <div className="text-left">
                  <h3 className="text-[#0C0F14] dark:text-white font-medium">{curr.code}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{curr.name}</p>
                </div>
              </div>
              {selected === curr.code && (
                <Check className="w-5 h-5 text-[#0D4F3C] dark:text-[#156B53]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
