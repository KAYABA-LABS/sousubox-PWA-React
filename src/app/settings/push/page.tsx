"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function PushNotifications() {
  const router = useRouter();
  const [transactions, setTransactions] = useState(true);
  const [deposits, setDeposits] = useState(true);
  const [withdrawals, setWithdrawals] = useState(true);
  const [bills, setBills] = useState(true);
  const [security, setSecurity] = useState(true);
  const [promotional, setPromotional] = useState(false);

  const settings = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Transaction Alerts",
      description: "Notify me of all transactions",
      value: transactions,
      onChange: setTransactions,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Deposits",
      description: "When money is added to your account",
      value: deposits,
      onChange: setDeposits,
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Withdrawals",
      description: "When money leaves your account",
      value: withdrawals,
      onChange: setWithdrawals,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Bill Reminders",
      description: "Upcoming bill payment reminders",
      value: bills,
      onChange: setBills,
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Security Alerts",
      description: "Login attempts and security updates",
      value: security,
      onChange: setSecurity,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Promotional",
      description: "New features and offers",
      value: promotional,
      onChange: setPromotional,
    },
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

        <h1 className="text-2xl font-bold text-white mb-2">
          Push Notifications
        </h1>
        <p className="text-gray-400 mb-6">
          Manage real-time alerts and updates
        </p>

        <div className="space-y-3">
          {settings.map((setting, index) => (
            <div key={index} className="bg-[#151A1F] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-gray-400 mt-1">{setting.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setting.onChange(!setting.value)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    setting.value ? "bg-[#00E660]" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      setting.value ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Notification Sound</h3>
          <select className="w-full bg-[#0C0F14] rounded-xl p-3 text-white border border-white/10 focus:border-[#00E660] focus:outline-none transition-colors">
            <option>Default</option>
            <option>Chime</option>
            <option>Bell</option>
            <option>None</option>
          </select>
        </div>
      </div>
    </div>
  );
}
