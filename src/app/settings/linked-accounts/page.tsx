"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserService } from "@/services/userService";
import { type FundingSource } from "@/lib/api";
import { getNetworkLabel, maskLast4, extractLast4 } from "@/lib/momo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LinkedAccounts() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const userService = useUserService();

  const [accounts, setAccounts] = useState<FundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [accountPendingDelete, setAccountPendingDelete] = useState<FundingSource | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const loadFundingSources = async () => {
      try {
        const sources = await userService.getFundingSources(userId || "");
        setAccounts(sources);
      } catch (err) {
        console.error("Failed to load funding sources:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFundingSources();
  }, [isLoaded, userId, router, userService]);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => Number(b.active) - Number(a.active)),
    [accounts]
  );

  const handleSetPrimary = async (fundingSource: FundingSource) => {
    const key = `${fundingSource.networkId}-${fundingSource.phoneNumber}`;
    setPendingKey(key);
    try {
      const updated = await userService.setActiveFundingSource(userId || "", {
        networkId: fundingSource.networkId,
        phoneNumber: fundingSource.phoneNumber,
      });
      setAccounts(updated);
    } catch (err) {
      console.error("Failed to set active funding source:", err);
      toast.error("Failed to switch payment number. Please try again.");
    } finally {
      setPendingKey(null);
    }
  };

  const handleRemove = async (fundingSource: FundingSource) => {
    const key = `${fundingSource.networkId}-${fundingSource.phoneNumber}`;
    setPendingKey(key);
    try {
      const updated = await userService.removeFundingSource(userId || "", {
        networkId: fundingSource.networkId,
        phoneNumber: fundingSource.phoneNumber,
      });
      setAccounts(updated);
    } catch (err) {
      console.error("Failed to remove funding source:", err);
      toast.error("Failed to remove number. Please try again.");
    } finally {
      setPendingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0D4F3C] dark:text-[#156B53] animate-spin" />
      </div>
    );
  }

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-1">
              Linked Mobile Money
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {accounts.length} {accounts.length === 1 ? "number" : "numbers"} linked
            </p>
          </div>
          <Button
            onClick={() => router.push("/settings/add-account")}
            className="flex items-center gap-2 bg-[#0D4F3C] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#156B53] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {sortedAccounts.length === 0 ? (
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-8 text-center">
            <Smartphone className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-[#0C0F14] dark:text-white font-medium mb-1">No mobile money numbers linked yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add a number to start sending and receiving payments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAccounts.map((account) => {
              const key = `${account.networkId}-${account.phoneNumber}`;
              const isPending = pendingKey === key;
              return (
                <div
                  key={key}
                  className="bg-white dark:bg-[#151A1F] rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-[#1A1F25] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#0C0F14] dark:text-white font-medium">
                          {getNetworkLabel(account.networkId)}
                        </h3>
                        {account.active && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 font-semibold rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          >
                            PRIMARY
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {maskLast4(extractLast4(account.phoneNumber))}
                      </p>
                    </div>
                    {!account.active && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={() => setAccountPendingDelete(account)}
                          disabled={isPending}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleSetPrimary(account)}
                          disabled={isPending}
                          variant="outline"
                          size="sm"
                          className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0C0F14] dark:text-white text-xs uppercase tracking-wide gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                          Switch payment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 bg-white dark:bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-[#0C0F14] dark:text-white font-semibold mb-2">Why link accounts?</h3>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Instant deposits from your mobile wallet</li>
            <li>• No routing or account numbers to remember</li>
            <li>• Switch your primary payment number anytime</li>
            <li>• Your mobile money PIN is never stored by us</li>
          </ul>
        </div>
      </div>

      <AlertDialog
        open={!!accountPendingDelete}
        onOpenChange={(open) => !open && setAccountPendingDelete(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">
              Remove this number?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              {accountPendingDelete && (
                <>
                  This will remove{" "}
                  <span className="text-[#0C0F14] dark:text-white font-medium">
                    {getNetworkLabel(accountPendingDelete.networkId)}{" "}
                    {maskLast4(extractLast4(accountPendingDelete.phoneNumber))}
                  </span>{" "}
                  from your linked accounts. You can add it back anytime.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0C0F14] dark:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => accountPendingDelete && handleRemove(accountPendingDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
