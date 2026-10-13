"use client";

import { useState } from "react";
import { Clock, MessageSquareText } from "lucide-react";
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
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { formatDate, formatDateTime, memberName } from "@/lib/pool-format";
import type { PoolJoinRequestForModerator } from "@/lib/api";
import { GPCard, GPChip } from "./ui";

interface JoinRequestReviewCardProps {
  request: PoolJoinRequestForModerator;
  busy: "approve" | "reject" | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function JoinRequestReviewCard({ request, busy, onApprove, onReject }: JoinRequestReviewCardProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const { user } = request;
  const stats = user.stats;
  const name = memberName(user);
  const awaitingFunds = request.status === "AWAITING_FUNDS";

  return (
    <GPCard>
      <div className="flex items-start gap-3">
        <MemberAvatar user={user} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{name}</p>
            {awaitingFunds && <GPChip tone="primary">Waiting for funds</GPChip>}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            @{user.username} · on Sousubox since {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {stats ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Reputation" value={String(Math.round(stats.reputationScore))} />
          <Stat label="Completed" value={String(stats.poolsCompleted)} />
          <Stat label="Defaulted" value={String(stats.poolsDefaulted)} warn={stats.poolsDefaulted > 0} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">No pool history yet.</p>
      )}

      {request.note && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#FBF6EF] dark:bg-white/5 p-3 text-sm text-gray-700 dark:text-gray-300">
          <MessageSquareText className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
          <span className="whitespace-pre-line">{request.note}</span>
        </p>
      )}

      {request.expiresAt && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {awaitingFunds ? "Has until" : "Expires"} {formatDateTime(request.expiresAt)}
        </p>
      )}

      {!awaitingFunds && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setRejecting(true)}
            disabled={busy !== null}
            className="h-11 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold text-[#0C0F14] dark:text-white disabled:opacity-50"
          >
            {busy === "reject" ? "Declining…" : "Decline"}
          </button>
          <button
            onClick={onApprove}
            disabled={busy !== null}
            className="h-11 rounded-xl bg-[#0D4F3C] hover:bg-[#156B53] text-white text-sm font-bold disabled:opacity-50"
          >
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
        </div>
      )}

      <AlertDialog open={rejecting} onOpenChange={setRejecting}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">Decline {name}?</AlertDialogTitle>
            <AlertDialogDescription>This is final: they won&apos;t be able to request this pool again.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder="Reason (optional)"
            className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction onClick={() => onReject(reason.trim())} className="bg-red-600 hover:bg-red-700 text-white">
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GPCard>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${warn ? "bg-red-50 dark:bg-red-500/10" : "bg-black/5 dark:bg-white/5"}`}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${warn ? "text-red-700 dark:text-red-400" : "text-[#0C0F14] dark:text-white"}`}>{value}</p>
    </div>
  );
}
