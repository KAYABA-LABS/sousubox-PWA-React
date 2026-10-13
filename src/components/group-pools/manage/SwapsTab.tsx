"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefetchOnFocus, useVisiblePolling } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { formatDate, memberName } from "@/lib/pool-format";
import { swappableCycles, swapPreview } from "@/lib/groupPoolOrder";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratedPool, PoolTransparency, SwapRequest } from "@/lib/api";
import { SwapSummary } from "../SwapCards";
import { GPCard, GPPrimaryButton, GPSectionTitle } from "../ui";

interface SwapsTabProps {
  pool: ModeratedPool;
  userId: string;
}

type Timeline = PoolTransparency["payoutTimeline"];

const recipientName = (entry: Timeline[number] | undefined) => (entry?.recipient ? memberName(entry.recipient) : "To be decided");

/** Two pickers of future cycles, a before/after preview, then Propose (plan decision 20). */
export function SwapsTab({ pool, userId }: SwapsTabProps) {
  const service = useGroupPoolService();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [cycleA, setCycleA] = useState<string>("");
  const [cycleB, setCycleB] = useState<string>("");
  const [proposing, setProposing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const reload = useCallback(() => {
    Promise.all([service.getTransparency(userId, pool.id), service.getSwaps(userId, pool.id)]).then(
      ([transparency, list]) => {
        setTimeline(transparency.payoutTimeline);
        setSwaps(list);
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setTimeline((prev) => prev ?? []);
      }
    );
  }, [service, userId, pool.id]);

  useEffect(() => {
    reload();
  }, [reload]);
  const pending = swaps.filter((s) => s.status === "PENDING");
  useRefetchOnFocus(reload);
  useVisiblePolling(reload, pending.length > 0);

  if (timeline === null) return <Skeleton className="h-64 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />;

  const options = swappableCycles(timeline, pool.currentCycle);
  const a = Number(cycleA);
  const b = Number(cycleB);
  const ready = a > 0 && b > 0 && a !== b;
  const preview = ready ? swapPreview(timeline, a, b) : null;
  const canPropose = pool.status === "ACTIVE";

  const propose = async () => {
    if (!ready) return;
    setProposing(true);
    try {
      await service.proposeSwap(userId, pool.id, a, b);
      track("group_swap_proposed", { poolId: pool.id });
      toast.success("Swap proposed. Both members need to accept it.");
      setCycleA("");
      setCycleB("");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setProposing(false);
    reload();
  };

  const cancel = async (swap: SwapRequest) => {
    setCancelling(swap.id);
    try {
      await service.cancelSwap(userId, swap.id);
      toast.success("Swap cancelled");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setCancelling(null);
    reload();
  };

  const optionLabel = (entry: Timeline[number]) =>
    `Cycle ${entry.cycleNumber} · ${recipientName(entry)} · ${formatDate(entry.expectedPayoutDate)}`;

  return (
    <div className="space-y-4">
      <GPCard>
        <GPSectionTitle>Propose a swap</GPSectionTitle>
        {!canPropose ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Swaps are only possible while the pool is active, not paused.</p>
        ) : options.length < 2 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">There aren&apos;t two upcoming payouts left to swap.</p>
        ) : (
          <div className="space-y-3">
            {[
              { id: "swap-a", label: "First payout", value: cycleA, set: setCycleA, exclude: cycleB },
              { id: "swap-b", label: "Second payout", value: cycleB, set: setCycleB, exclude: cycleA },
            ].map((picker) => (
              <div key={picker.id} className="space-y-1.5">
                <label id={`${picker.id}-label`} className="block text-xs font-bold text-[#0C0F14] dark:text-white">
                  {picker.label}
                </label>
                <Select value={picker.value} onValueChange={picker.set}>
                  <SelectTrigger aria-labelledby={`${picker.id}-label`} className="h-12 rounded-xl bg-white dark:bg-[#0C0F14]">
                    <SelectValue placeholder="Choose a cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter((entry) => String(entry.cycleNumber) !== picker.exclude)
                      .map((entry) => (
                        <SelectItem key={entry.cycleNumber} value={String(entry.cycleNumber)}>
                          {optionLabel(entry)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {preview && (
              <div className="rounded-xl bg-[#FBF6EF] dark:bg-white/5 p-3 text-sm" data-testid="swap-preview">
                {[a, b].map((cycle) => (
                  <p key={cycle} className="text-[#0C0F14] dark:text-white">
                    Cycle {cycle}: <span className="text-gray-500 line-through">{recipientName(timeline.find((t) => t.cycleNumber === cycle))}</span>{" "}
                    → <span className="font-semibold">{recipientName(preview.find((t) => t.cycleNumber === cycle))}</span>
                  </p>
                ))}
              </div>
            )}

            <GPPrimaryButton disabled={!ready} loading={proposing} onClick={propose}>
              Propose swap
            </GPPrimaryButton>
          </div>
        )}
      </GPCard>

      {pending.map((swap) => (
        <SwapSummary
          key={swap.id}
          swap={swap}
          actions={
            <button
              onClick={() => cancel(swap)}
              disabled={cancelling === swap.id}
              className="w-full h-10 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold text-red-600 dark:text-red-400 disabled:opacity-50"
            >
              {cancelling === swap.id ? "Cancelling…" : "Cancel swap"}
            </button>
          }
        />
      ))}

      {swaps
        .filter((s) => s.status !== "PENDING")
        .slice(0, 5)
        .map((swap) => (
          <SwapSummary key={swap.id} swap={swap} />
        ))}
    </div>
  );
}
