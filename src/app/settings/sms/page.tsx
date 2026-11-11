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
          SMS Notifications
        </h1>
        <div className="space-y-3">
          {toggles.map((toggle, i) => (
            <div
              key={i}
              className="bg-sb-surface rounded-2xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-sb-ink font-medium">{toggle.title}</h3>
                <p className="text-sm text-sb-ink-2">{toggle.description}</p>
              </div>
              <button
                onClick={() => toggle.onChange(!toggle.value)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  toggle.value ? "bg-sb-brand-800" : "bg-gray-300 dark:bg-gray-600"
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
