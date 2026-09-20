"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gamepad2,
  Wine,
  Plane,
} from "lucide-react";

export default function MerchantCategories() {
  const router = useRouter();
  const [gambling, setGambling] = useState(true);
  const [alcohol, setAlcohol] = useState(false);
  const [travel, setTravel] = useState(false);

  const categories = [
    {
      icon: <Gamepad2 className="w-5 h-5" />,
      title: "Gambling",
      value: gambling,
      onChange: setGambling,
    },
    {
      icon: <Wine className="w-5 h-5" />,
      title: "Alcohol & Bars",
      value: alcohol,
      onChange: setAlcohol,
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: "Travel & Hotels",
      value: travel,
      onChange: setTravel,
    },
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
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-2">
          Merchant Categories
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Block transactions from specific categories
        </p>
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <div className="text-gray-500 dark:text-gray-400">{cat.icon}</div>
                <h3 className="text-[#0C0F14] dark:text-white font-medium">{cat.title}</h3>
              </div>
              <button
                onClick={() => cat.onChange(!cat.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                  cat.value
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                }`}
              >
                {cat.value ? "Blocked" : "Allow"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
