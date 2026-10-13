"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { formatDate, formatGhs } from "@/lib/pool-format";
import { INTERVAL_OPTIONS, ORDER_TYPES } from "@/lib/groupPoolForm";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratedPool } from "@/lib/api";
import { BondHealthBar } from "../BondHealthBar";
import { InviteShareCard } from "../InviteShareCard";
import { GPCard, GPSecondaryButton, GPSectionTitle } from "../ui";

interface OverviewTabProps {
  pool: ModeratedPool;
  userId: string;
  onChanged: () => void;
}

export function OverviewTab({ pool, userId, onChanged }: OverviewTabProps) {
  const router = useRouter();
  const service = useGroupPoolService();
  const [extending, setExtending] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const forming = pool.status === "FORMING";

  const interval =
    INTERVAL_OPTIONS.find((o) => o.days === pool.payoutIntervalDays)?.label ?? `Every ${pool.payoutIntervalDays} days`;
  const order = ORDER_TYPES.find((o) => o.value === pool.payoutOrderType)?.label ?? pool.payoutOrderType;

  const regenerate = async () => {
    try {
      await service.regenerateInviteCode(userId, pool.id);
      track("group_invite_regenerated", { poolId: pool.id });
      toast.success("New code created. The old one no longer works.");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    onChanged();
  };

  const extend = async () => {
    setExtending(true);
    try {
      const result = await service.extendPool(userId, pool.id);
      toast.success(`Deadline extended to ${formatDate(result.formingDeadline)}`);
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setExtending(false);
    onChanged();
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      await service.cancelPool(userId, pool.id, cancelReason.trim() || undefined);
      track("group_pool_cancelled", { poolId: pool.id });
      toast.success("Pool cancelled. Everyone has been refunded.");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setCancelling(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <GPCard>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Info label="Members" value={`${pool.currentMemberCount}/${pool.maxMembers}`} />
          <Info label="Daily" value={formatGhs(pool.contributionAmount)} />
          <Info label="Payout" value={interval} />
          <Info label="Order" value={order} />
          {!forming && <Info label="Cycle" value={`${pool.currentCycle}/${pool.totalCycles}`} />}
        </div>
      </GPCard>

      {forming && pool.inviteCode && (
        <InviteShareCard poolId={pool.id} poolName={pool.name} code={pool.inviteCode} onRegenerate={regenerate} />
      )}

      {forming && pool.formingDeadline && (
        <GPCard>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#0D4F3C] dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">Fill by {formatDate(pool.formingDeadline)}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  If it isn&apos;t full by then, it&apos;s cancelled and everyone is refunded.
                </p>
              </div>
            </div>
            <button
              onClick={extend}
              disabled={extending}
              className="shrink-0 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs font-bold text-[#0C0F14] dark:text-white disabled:opacity-50"
            >
              {extending ? "Extending…" : "Extend once"}
            </button>
          </div>
        </GPCard>
      )}

      {pool.bond && (
        <GPCard>
          <GPSectionTitle>Your guarantee</GPSectionTitle>
          <BondHealthBar bond={pool.bond} poolStatus={pool.status} />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Your guarantee is locked while the pool runs. If a member defaults, it pays their days and they owe that amount
            back. If it runs out, the pool pauses payouts until you top up.
          </p>
        </GPCard>
      )}

      {forming && (
        <div className="space-y-2">
          <GPSecondaryButton onClick={() => router.push(`/moderator/pools/${pool.id}/edit`)}>
            <Pencil className="w-4 h-4" /> Edit pool
          </GPSecondaryButton>
          <GPSecondaryButton
            loading={cancelling}
            onClick={() => setConfirmCancel(true)}
            className="text-red-600 dark:text-red-400"
          >
            <XCircle className="w-4 h-4" /> Cancel pool
          </GPSecondaryButton>
        </div>
      )}

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">Cancel this pool?</AlertDialogTitle>
            <AlertDialogDescription>
              Every member gets a full refund and your guarantee is released. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={500}
            placeholder="Reason (optional)"
            className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep pool</AlertDialogCancel>
            <AlertDialogAction onClick={cancel} className="bg-red-600 hover:bg-red-700 text-white">
              Cancel pool
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-[#0C0F14] dark:text-white">{value}</p>
    </div>
  );
}
