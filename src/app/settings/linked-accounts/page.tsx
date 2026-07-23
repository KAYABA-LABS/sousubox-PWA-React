"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark, Plus, CheckCircle2, XCircle } from "lucide-react";

export default function LinkedAccounts() {
  const router = useRouter();

  const accounts = [
    {
      id: 1,
      bank: "Chase Bank",
      accountType: "Checking",
      last4: "1234",
      status: "Verified",
      addedDate: "Jan 5, 2026",
    },
    {
      id: 2,
      bank: "Bank of America",
      accountType: "Savings",
      last4: "5678",
      status: "Pending",
      addedDate: "Jan 10, 2026",
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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Linked Bank Accounts
            </h1>
            <p className="text-gray-400 text-sm">
              {accounts.length} accounts connected
            </p>
          </div>
          <button
            onClick={() => router.push("/settings/add-account")}
            className="flex items-center gap-2 bg-[#00E660] text-black px-4 py-2 rounded-xl font-medium hover:bg-[#00D055] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-[#151A1F] rounded-2xl p-4 hover:bg-[#1A1F25] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{account.bank}</h3>
                    {account.status === "Verified" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00E660]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {account.accountType} ••••{account.last4}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{account.status}</span>
                    <span>•</span>
                    <span>Added {account.addedDate}</span>
                  </div>
                </div>
                <button className="text-red-400 text-sm hover:text-red-300">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Why link accounts?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Instant transfers between accounts</li>
            <li>• No transfer fees</li>
            <li>• Track all balances in one place</li>
            <li>• Bank-level security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
