"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SMSNotifications() {
  const router = useRouter();
  const [large, setLarge] = useState(true);
  const [security, setSecurity] = useState(true);
  const [bills, setBills] = useState(false);

  const toggles = [
    {
      title: "Large Transactions",
      description: "Over $500",
      value: large,
      onChange: setLarge,
    },
    {
      title: "Security Alerts",
      description: "Login and password changes",
      value: security,
      onChange: setSecurity,
    },
    {
      title: "Bill Reminders",
      description: "Upcoming payments",
      value: bills,
      onChange: setBills,
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
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">
          SMS Notifications
        </h1>
        <div className="space-y-3">
          {toggles.map((toggle, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-[#0C0F14] dark:text-white font-medium">{toggle.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{toggle.description}</p>
              </div>
              <button
                onClick={() => toggle.onChange(!toggle.value)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  toggle.value ? "bg-[#0D4F3C]" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    toggle.value ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
