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
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-sb-ink mb-2">
          Merchant Categories
        </h1>
        <p className="text-sb-ink-2 mb-6">
          Block transactions from specific categories
        </p>
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-sb-surface rounded-2xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <div className="text-sb-ink-2">{cat.icon}</div>
                <h3 className="text-sb-ink font-medium">{cat.title}</h3>
              </div>
              <button
                onClick={() => cat.onChange(!cat.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                  cat.value
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-sb-surface-2 text-sb-ink-2"
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
