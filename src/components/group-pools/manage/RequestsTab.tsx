"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { useGroupPoolService } from "@/services/groupPoolService";
import { useRefetchOnFocus, useVisiblePolling } from "@/hooks/use-refetch";
import { track } from "@/lib/analytics";
import { memberName } from "@/lib/pool-format";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { PoolJoinRequestForModerator } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinRequestReviewCard } from "../JoinRequestReviewCard";
import { GPCard } from "../ui";

interface RequestsTabProps {
  poolId: string;
  userId: string;
  canReview: boolean;
  /** Pool counts and badges change after a decision. */
  onChanged: () => void;
}

export function RequestsTab({ poolId, userId, canReview, onChanged }: RequestsTabProps) {
  const service = useGroupPoolService();
  const [pending, setPending] = useState<PoolJoinRequestForModerator[] | null>(null);
  const [awaiting, setAwaiting] = useState<PoolJoinRequestForModerator[]>([]);
  const [busy, setBusy] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  const reload = useCallback(() => {
    Promise.all([
      service.getPoolRequests(userId, poolId, "PENDING"),
      service.getPoolRequests(userId, poolId, "AWAITING_FUNDS").catch(() => []),
    ]).then(
      ([pendingList, awaitingList]) => {
        setPending(pendingList);
        setAwaiting(awaitingList);
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setPending((prev) => prev ?? []);
      }
    );
  }, [service, userId, poolId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload);
  useVisiblePolling(reload, true);

  const approve = async (request: PoolJoinRequestForModerator) => {
    setBusy({ id: request.id, action: "approve" });
    const name = memberName(request.user);
    try {
      const result = await service.approveRequest(userId, request.id);
      track("group_request_approved", { poolId, requestId: request.id, outcome: result.status });
      if (result.status === "AWAITING_FUNDS") {
        toast.success(`Approved. Waiting for ${name} to add funds — their spot isn't held until they do.`);
      } else {
        toast.success(`${name} joined the pool`);
      }
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setBusy(null);
    reload();
    onChanged();
  };

  const reject = async (request: PoolJoinRequestForModerator, reason: string) => {
    setBusy({ id: request.id, action: "reject" });
    try {
      await service.rejectRequest(userId, request.id, reason || undefined);
      track("group_request_rejected", { poolId, requestId: request.id });
      toast.success("Request declined");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setBusy(null);
    reload();
    onChanged();
  };

  if (pending === null) {
    return <Skeleton className="h-48 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />;
  }

  return (
    <div className="space-y-3">
      {!canReview && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">This pool isn&apos;t taking new members.</p>
      )}
      {pending.length === 0 ? (
        <GPCard className="flex flex-col items-center text-center py-10">
          <Inbox className="w-7 h-7 text-gray-400 mb-2" strokeWidth={1.75} />
          <p className="text-sm font-bold text-[#0C0F14] dark:text-white">No pending requests</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share your invite code to get requests.</p>
        </GPCard>
      ) : (
        pending.map((request) => (
          <JoinRequestReviewCard
            key={request.id}
            request={request}
            busy={busy?.id === request.id ? busy.action : null}
            onApprove={() => approve(request)}
            onReject={(reason) => reject(request, reason)}
          />
        ))
      )}

      {awaiting.length > 0 && (
        <section className="space-y-3 pt-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">
            Approved, waiting for funds
          </h3>
          {awaiting.map((request) => (
            <JoinRequestReviewCard key={request.id} request={request} busy={null} onApprove={() => {}} onReject={() => {}} />
          ))}
        </section>
      )}
    </div>
  );
}
