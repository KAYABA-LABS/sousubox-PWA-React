"use client";

import { ArrowLeftRight, CheckCircle2, Clock } from "lucide-react";
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { formatDateTime, memberName } from "@/lib/pool-format";
import { swapSide } from "@/lib/groupPoolOrder";
import type { SwapRequest, SwapStatus } from "@/lib/api";
import { GPCard, GPChip, type ChipTone } from "./ui";

const SWAP_STATUS: Record<SwapStatus, { label: string; tone: ChipTone }> = {
  PENDING: { label: "Waiting", tone: "amber" },
  ACCEPTED: { label: "Swapped", tone: "emerald" },
  REJECTED: { label: "Declined", tone: "gray" },
  EXPIRED: { label: "Expired", tone: "gray" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
};

function Side({ user, cycle, accepted, showAcceptance }: { user: SwapRequest["userA"]; cycle: number; accepted: boolean; showAcceptance: boolean }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-1">
      <MemberAvatar user={user} size="sm" />
      <p className="text-xs font-semibold text-[#0C0F14] dark:text-white truncate max-w-full">{memberName(user)}</p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400">Cycle {cycle}</p>
      {showAcceptance &&
        (accepted ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Not yet
          </span>
        ))}
    </div>
  );
}

/** One swap: who moves where, each side's acceptance, and status. `actions` renders below. */
export function SwapSummary({ swap, actions }: { swap: SwapRequest; actions?: React.ReactNode }) {
  const chip = SWAP_STATUS[swap.status] ?? { label: swap.status, tone: "gray" as ChipTone };
  const pending = swap.status === "PENDING";
  return (
    <GPCard className={pending ? undefined : "opacity-75"}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0C0F14] dark:text-white">Payout swap</p>
        <GPChip tone={chip.tone}>{chip.label}</GPChip>
      </div>
      <div className="flex items-center gap-2">
        <Side user={swap.userA} cycle={swap.cycleA} accepted={!!swap.acceptedAAt} showAcceptance={pending} />
        <ArrowLeftRight className="w-4 h-4 text-gray-400 shrink-0" />
        <Side user={swap.userB} cycle={swap.cycleB} accepted={!!swap.acceptedBAt} showAcceptance={pending} />
      </div>
      {pending && (
        <p className="mt-3 text-center text-[11px] text-gray-500 dark:text-gray-400">Expires {formatDateTime(swap.expiresAt)}</p>
      )}
      {actions && <div className="mt-3">{actions}</div>}
    </GPCard>
  );
}

/** Member-facing request: "Move your payout from cycle X to cycle Y?" with Accept/Decline. */
export function SwapRequestCard({
  swap,
  userId,
  busy,
  onAccept,
  onDecline,
}: {
  swap: SwapRequest;
  userId: string;
  busy: "accept" | "decline" | null;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const side = swapSide(swap, userId);
  const from = side === "A" ? swap.cycleA : swap.cycleB;
  const to = side === "A" ? swap.cycleB : swap.cycleA;
  const other = side === "A" ? swap.userB : swap.userA;
  return (
    <SwapSummary
      swap={swap}
      actions={
        <>
          <p className="text-sm text-[#0C0F14] dark:text-white text-center mb-3">
            Move your payout from cycle {from} to cycle {to}, swapping with {memberName(other)}?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onDecline}
              disabled={busy !== null}
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold text-[#0C0F14] dark:text-white disabled:opacity-50"
            >
              {busy === "decline" ? "Declining…" : "Decline"}
            </button>
            <button
              onClick={onAccept}
              disabled={busy !== null}
              className="h-11 rounded-xl bg-[#0D4F3C] hover:bg-[#156B53] text-white text-sm font-bold disabled:opacity-50"
            >
              {busy === "accept" ? "Accepting…" : "Accept swap"}
            </button>
          </div>
        </>
      }
    />
  );
}
