"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMobileMoneyStore } from "@/stores/useMobileMoneyStore";
import { getNetworkLabel, maskLast4 } from "@/lib/momo";

export default function LinkedAccounts() {
  const router = useRouter();
  const accounts = useMobileMoneyStore((s) => s.accounts);
  const setPrimary = useMobileMoneyStore((s) => s.setPrimary);
  const removeAccount = useMobileMoneyStore((s) => s.removeAccount);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => Number(b.status) - Number(a.status)),
    [accounts]
  );

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
              Linked Mobile Money
            </h1>
            <p className="text-gray-400 text-sm">
              {accounts.length} {accounts.length === 1 ? "number" : "numbers"} linked
            </p>
          </div>
          <Button
            onClick={() => router.push("/settings/add-account")}
            className="flex items-center gap-2 bg-[#00E660] text-black px-4 py-2 rounded-xl font-medium hover:bg-[#00D055] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {sortedAccounts.length === 0 ? (
          <div className="bg-[#151A1F] rounded-2xl p-8 text-center">
            <Smartphone className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No mobile money numbers linked yet</p>
            <p className="text-sm text-gray-400">
              Add a number to start sending and receiving payments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-[#151A1F] rounded-2xl p-4 hover:bg-[#1A1F25] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">
                        {getNetworkLabel(account.network)}
                      </h3>
                      {account.status && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 font-semibold rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        >
                          PRIMARY
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 font-mono">
                      {maskLast4(account.last4)}
                    </p>
                  </div>
                  {!account.status && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => removeAccount(account.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setPrimary(account.id)}
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-wide gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Switch payment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Why link accounts?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Instant deposits from your mobile wallet</li>
            <li>• No routing or account numbers to remember</li>
            <li>• Switch your primary payment number anytime</li>
            <li>• Your mobile money PIN is never stored by us</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
