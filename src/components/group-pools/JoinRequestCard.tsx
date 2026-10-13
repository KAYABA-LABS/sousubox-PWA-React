"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Clock } from "lucide-react";
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
import { formatDate, formatDateTime, formatGhs } from "@/lib/pool-format";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { JoinRequestStatus, MyJoinRequest } from "@/lib/api";
import { GPCard, GPChip, GPPrimaryButton, GPSecondaryButton, type ChipTone } from "./ui";

const STATUS_CHIPS: Record<JoinRequestStatus, { label: string; tone: ChipTone }> = {
  PENDING: { label: "Waiting for moderator", tone: "amber" },
  APPROVED: { label: "Approved", tone: "emerald" },
  AWAITING_FUNDS: { label: "Approved · add funds", tone: "primary" },
  JOINED: { label: "Joined", tone: "emerald" },
  REJECTED: { label: "Not accepted", tone: "red" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  EXPIRED: { label: "Expired", tone: "gray" },
};

export const OPEN_REQUEST_STATUSES: JoinRequestStatus[] = ["PENDING", "AWAITING_FUNDS"];

function useNow(intervalMs: number, enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

function timeLeft(expiresAt: string | null, now: number) {
  if (!expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return null;
  if (end <= now) return "expiring now";
  return `${formatDistanceToNowStrict(end)} left`;
}

interface JoinRequestCardProps {
  request: MyJoinRequest;
  /** Amount still needed for an AWAITING_FUNDS request, when the balance is known. */
  shortfall: number | null;
  busy: "cancel" | "complete" | null;
  onCancel: () => void;
  onComplete: () => void;
  onOpenPool: () => void;
}

export function JoinRequestCard({ request, shortfall, busy, onCancel, onComplete, onOpenPool }: JoinRequestCardProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isOpen = OPEN_REQUEST_STATUSES.includes(request.status);
  const now = useNow(60_000, isOpen);
  const chip = STATUS_CHIPS[request.status] ?? { label: request.status, tone: "gray" as ChipTone };
  const remaining = timeLeft(request.expiresAt, now);

  return (
    <GPCard className={isOpen ? undefined : "opacity-80"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{request.pool.name}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {formatGhs(request.pool.contributionAmount)} daily · payout every {request.pool.payoutIntervalDays}{" "}
            {request.pool.payoutIntervalDays === 1 ? "day" : "days"}
          </p>
        </div>
        <GPChip tone={chip.tone} className="shrink-0">
          {chip.label}
        </GPChip>
      </div>

      <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
          <span>Requested {formatDate(request.createdAt)}</span>
          <span>Join amount {formatGhs(request.pool.joinAmount)}</span>
        </div>

        {request.status === "PENDING" && (
          <>
            {remaining && (
              <p className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5" /> Expires {formatDateTime(request.expiresAt)} · {remaining}
              </p>
            )}
            <GPSecondaryButton loading={busy === "cancel"} onClick={() => setConfirmCancel(true)}>
              Cancel request
            </GPSecondaryButton>
          </>
        )}

        {request.status === "AWAITING_FUNDS" && (
          <>
            <p className="text-sm text-[#0C0F14] dark:text-white leading-relaxed">
              {groupPoolCopy.awaitingFunds(
                shortfall !== null && shortfall > 0 ? formatGhs(shortfall) : formatGhs(request.pool.joinAmount),
                formatDateTime(request.expiresAt)
              )}
            </p>
            {remaining && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" /> {remaining}
              </p>
            )}
            <GPPrimaryButton loading={busy === "complete"} onClick={onComplete}>
              {groupPoolCopy.topUpAndComplete}
            </GPPrimaryButton>
            <GPSecondaryButton disabled={busy !== null} onClick={() => setConfirmCancel(true)}>
              Cancel request
            </GPSecondaryButton>
          </>
        )}

        {request.status === "REJECTED" && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{groupPoolCopy.rejected}</p>
        )}

        {(request.status === "JOINED" || request.status === "APPROVED") && (
          <GPSecondaryButton onClick={onOpenPool}>Open the pool</GPSecondaryButton>
        )}
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">Cancel this request?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need the invite code again to send a new request to {request.pool.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GPCard>
  );
}
