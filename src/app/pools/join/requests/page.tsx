"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useRefetchOnFocus, useVisiblePolling } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { api, type MyJoinRequest } from "@/lib/api";
import { track } from "@/lib/analytics";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import { resolveGroupPoolError, syntheticError, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinRequestCard, OPEN_REQUEST_STATUSES } from "@/components/group-pools/JoinRequestCard";
import { GateSheet } from "@/components/group-pools/GateSheet";
import { GPCard, GPFullPageLoader, GPPageHeader } from "@/components/group-pools/ui";

export default function MyJoinRequestsPage() {
  return (
    <Suspense fallback={<GPFullPageLoader />}>
      <MyJoinRequestsContent />
    </Suspense>
  );
}

function MyJoinRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const completeParam = searchParams.get("complete");
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();

  const [requests, setRequests] = useState<MyJoinRequest[] | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState<{ id: string; action: "cancel" | "complete" } | null>(null);
  const [sheet, setSheet] = useState<{ error: ResolvedGroupPoolError; request: MyJoinRequest } | null>(null);
  const autoCompleted = useRef(false);

  const reload = useCallback(() => {
    if (!ready) return;
    Promise.all([service.getMyRequests(userId), api.getUserCheckingAccount(userId).catch(() => null)]).then(
      ([list, account]) => {
        setRequests(list);
        if (account?.success && account.checkingAccount) setAvailableBalance(account.checkingAccount.availableBalance);
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setRequests((prev) => prev ?? []);
      }
    );
  }, [ready, service, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const hasOpen = (requests ?? []).some((r) => OPEN_REQUEST_STATUSES.includes(r.status));
  useRefetchOnFocus(reload, ready);
  useVisiblePolling(reload, ready && hasOpen);

  const shortfallFor = (request: MyJoinRequest) =>
    availableBalance === null ? null : Math.max(0, request.pool.joinAmount - availableBalance);

  const runComplete = useCallback(
    async (request: MyJoinRequest, afterDeposit: boolean) => {
      setBusy({ id: request.id, action: "complete" });
      try {
        await service.completeJoin(userId, request.id);
        track("group_join_completed", { requestId: request.id, poolId: request.pool.id });
        toast.success(`You've joined ${request.pool.name}`);
      } catch (err) {
        const error = resolveGroupPoolError(err);
        if (afterDeposit && error.code === "INSUFFICIENT_FUNDS") {
          toast.error("Your deposit hasn't arrived yet. Try again in a moment — we'll also retry automatically.");
        } else if (error.treatment === "sheet") {
          setSheet({ error, request });
        } else {
          toast.error(error.message);
        }
      }
      setBusy(null);
      reload();
    },
    [service, userId, reload]
  );

  const complete = (request: MyJoinRequest) => {
    const shortfall = shortfallFor(request);
    // Known to be short: open the top-up sheet instead of making a call that will fail.
    if (shortfall !== null && shortfall > 0) {
      setSheet({
        error: syntheticError("INSUFFICIENT_FUNDS", { joinAmount: request.pool.joinAmount, availableBalance }),
        request,
      });
      return;
    }
    runComplete(request, false);
  };

  const cancel = async (request: MyJoinRequest) => {
    setBusy({ id: request.id, action: "cancel" });
    try {
      await service.cancelRequest(userId, request.id);
      track("group_join_request_cancelled", { requestId: request.id });
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setBusy(null);
    reload();
  };

  // Back from the deposit flow with ?complete=<id>: finish the join once.
  useEffect(() => {
    if (!completeParam || !requests || autoCompleted.current) return;
    autoCompleted.current = true;
    router.replace("/pools/join/requests");
    const request = requests.find((r) => r.id === completeParam);
    // Deposits can take a moment to credit, so let the server decide rather than the cached balance.
    // One-shot action triggered by the return URL, guarded by the ref above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (request?.status === "AWAITING_FUNDS") runComplete(request, true);
  }, [completeParam, requests, router, runComplete]);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader eyebrow="Group pools" title="My join requests" onBack={() => router.push("/pools/join")} />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-3">
        {requests === null ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-40 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />)
        ) : requests.length === 0 ? (
          <GPCard className="flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4 text-[#0D4F3C] dark:text-[#156B53]">
              <Inbox className="w-7 h-7" strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-1">No join requests yet</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[240px] leading-relaxed">
              Ask your group&apos;s moderator for an invite code to request a spot.
            </p>
            <button
              onClick={() => router.push("/pools/join")}
              className="px-6 py-2.5 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-95 text-white font-bold text-xs rounded-full transition-all"
            >
              {groupPoolCopy.joinWithCode}
            </button>
          </GPCard>
        ) : (
          requests.map((request) => (
            <JoinRequestCard
              key={request.id}
              request={request}
              shortfall={shortfallFor(request)}
              busy={busy?.id === request.id ? busy.action : null}
              onCancel={() => cancel(request)}
              onComplete={() => complete(request)}
              onOpenPool={() => router.push(`/pools/${request.pool.id}?type=joined`)}
            />
          ))
        )}
      </div>

      <GateSheet
        error={sheet?.error ?? null}
        onClose={() => setSheet(null)}
        joinAmount={sheet?.request.pool.joinAmount}
        returnTo={sheet ? `/pools/join/requests?complete=${sheet.request.id}` : undefined}
      />
    </main>
  );
}
