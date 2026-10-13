"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { formatGhs } from "@/lib/pool-format";
import { bondHealth } from "@/lib/groupPoolBond";
import { resolveGroupPoolError, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratedPool } from "@/lib/api";
import { BondHealthBar } from "../BondHealthBar";
import { GateSheet } from "../GateSheet";
import { GPCard, GPPrimaryButton, GPSectionTitle } from "../ui";

interface BondTabProps {
  pool: ModeratedPool;
  userId: string;
  onChanged: () => void;
}

export function BondTab({ pool, userId, onChanged }: BondTabProps) {
  const service = useGroupPoolService();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState<ResolvedGroupPoolError | null>(null);
  const health = bondHealth(pool.bond, pool.status);
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0;
  const suggestions = [0.25, 0.5, 1].map((share) => Math.ceil(pool.bond.initialAmount * share));

  const topUp = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const result = await service.topUpBond(userId, pool.id, value);
      track("group_bond_topped_up", { poolId: pool.id, resumed: result.resumed });
      if (result.resumed) {
        toast.success(
          `Pool resumed — ${result.releasedPayouts} held ${result.releasedPayouts === 1 ? "payout" : "payouts"} released`
        );
      } else {
        toast.success(`Guarantee topped up by ${formatGhs(value)}`);
      }
      setAmount("");
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.treatment === "sheet") setSheetError(error);
      else toast.error(error.message);
    }
    setSaving(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <GPCard>
        <GPSectionTitle>Your guarantee</GPSectionTitle>
        <BondHealthBar bond={pool.bond} poolStatus={pool.status} />
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Your guarantee is locked while the pool runs. If a member defaults, it pays their days and they owe that amount back.
          If it runs out, the pool pauses payouts until you top up.
        </p>
      </GPCard>

      <GPCard>
        <GPSectionTitle>Top up</GPSectionTitle>
        {health.needsTopUp && (
          <p className="mb-3 text-xs font-medium text-red-700 dark:text-red-400">
            Payouts are on hold. Topping up resumes the pool once missed days are covered, and held payouts are paid in order.
          </p>
        )}
        <label htmlFor="bond-amount" className="block text-xs font-bold text-[#0C0F14] dark:text-white mb-1.5">
          Amount (GH₵)
        </label>
        <input
          id="bond-amount"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-12 px-4 bg-white dark:bg-[#0C0F14] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#0C0F14] dark:text-white focus:outline-none focus:border-[#0D4F3C]"
        />
        {pool.bond.initialAmount > 0 && (
          <div className="mt-2 flex gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setAmount(String(suggestion))}
                className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0C0F14] dark:text-white"
              >
                {formatGhs(suggestion)}
              </button>
            ))}
          </div>
        )}
        <GPPrimaryButton className="mt-4" disabled={!valid} loading={saving} onClick={topUp}>
          Top up {valid ? formatGhs(value) : ""}
        </GPPrimaryButton>
      </GPCard>

      <GateSheet
        error={sheetError}
        onClose={() => setSheetError(null)}
        joinAmount={valid ? value : undefined}
        returnTo={`/moderator/pools/${pool.id}?tab=bond`}
      />
    </div>
  );
}
