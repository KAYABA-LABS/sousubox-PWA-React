"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Plus, ShieldCheck, ShieldOff, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useRefetchOnFocus } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { formatDate } from "@/lib/pool-format";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { ModeratedPool, ModeratorStatusResponse } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { EligibilityChecklist } from "@/components/group-pools/EligibilityChecklist";
import { ModeratedPoolCard } from "@/components/group-pools/ModeratedPoolCard";
import {
  GPCard,
  GPFullPageLoader,
  GPFullPageMessage,
  GPPageHeader,
  GPPrimaryButton,
  GPSecondaryButton,
  GPSectionTitle,
} from "@/components/group-pools/ui";

export default function ModeratorHomePage() {
  const router = useRouter();
  const { details, loaded, refresh } = useModeratorAreaStatus();

  useEffect(() => {
    if (details) track("moderator_status_viewed", { status: details.status });
  }, [details]);

  if (!loaded) return <GPFullPageLoader />;
  if (!details) {
    return (
      <GPFullPageMessage
        title="Couldn't load"
        message="We couldn't check your moderator status. Check your connection and try again."
        actionLabel="Try again"
        onAction={() => refresh()}
      />
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader
        eyebrow="Group pools"
        title="Pool Moderator"
        onBack={() => router.push("/profile")}
        right={
          details.status === "APPROVED" ? (
            <button
              onClick={() => router.push("/moderator/create")}
              className="h-10 px-4 inline-flex items-center gap-1.5 rounded-full bg-[#0D4F3C] hover:bg-[#156B53] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Create pool
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {details.status === "APPROVED" ? (
          <ModeratorDashboard maxPools={details.maxConcurrentModeratedPools} />
        ) : (
          <ModeratorStatusView details={details} onApply={() => router.push("/moderator/apply")} />
        )}
      </div>
    </main>
  );
}

function ModeratorStatusView({ details, onApply }: { details: ModeratorStatusResponse; onApply: () => void }) {
  const router = useRouter();
  const failures = details.eligibility?.failures ?? [];
  const canApplyNow = details.applicationsOpen && details.canApply;

  const header = (() => {
    switch (details.status) {
      case "PENDING":
        return {
          icon: <Clock className="w-6 h-6" />,
          title: "Application under review",
          text: `You applied on ${formatDate(details.appliedAt)}. We'll let you know once it's decided.`,
        };
      case "REJECTED":
        return {
          icon: <XCircle className="w-6 h-6" />,
          title: "Application not approved",
          text: details.decisionReason || "Your application wasn't approved this time.",
        };
      case "SUSPENDED":
        return {
          icon: <ShieldOff className="w-6 h-6" />,
          title: "Moderator role suspended",
          text: details.decisionReason || "Your moderator role is suspended. Contact support to find out more.",
        };
      case "REVOKED":
        return {
          icon: <ShieldOff className="w-6 h-6" />,
          title: "Moderator role revoked",
          text: details.decisionReason || "Your moderator role was revoked.",
        };
      default:
        return {
          icon: <ShieldCheck className="w-6 h-6" />,
          title: "Run a pool for your group",
          text: "Moderators create invite-only pools for people they know, approve who joins, and lock a guarantee that covers missed payments. You earn a share of the management fee.",
        };
    }
  })();

  const showChecklist = details.status === "NONE" || details.status === "REJECTED";

  return (
    <>
      <GPCard>
        <div className="w-12 h-12 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/15 text-[#0D4F3C] dark:text-emerald-300 flex items-center justify-center mb-3">
          {header.icon}
        </div>
        <h2 className="text-base font-bold text-[#0C0F14] dark:text-white">{header.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{header.text}</p>
        {details.decidedAt && details.status !== "NONE" && details.status !== "PENDING" && (
          <p className="text-[11px] text-gray-400 mt-2">Decided {formatDate(details.decidedAt)}</p>
        )}
      </GPCard>

      {showChecklist && details.eligibility && (
        <GPCard>
          <GPSectionTitle>What you need</GPSectionTitle>
          <EligibilityChecklist failures={failures} snapshot={details.eligibility.snapshot} />
        </GPCard>
      )}

      {showChecklist &&
        (!details.applicationsOpen ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">Applications aren&apos;t open yet.</p>
        ) : (
          <GPPrimaryButton disabled={!canApplyNow} onClick={onApply}>
            {details.status === "REJECTED" ? "Apply again" : "Apply to become a moderator"}
          </GPPrimaryButton>
        ))}

      {(details.status === "SUSPENDED" || details.status === "REVOKED") && (
        <GPSecondaryButton onClick={() => router.push("/settings/help")}>Contact support</GPSecondaryButton>
      )}
    </>
  );
}

function ModeratorDashboard({ maxPools }: { maxPools: number }) {
  const router = useRouter();
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();
  const [pools, setPools] = useState<ModeratedPool[] | null>(null);

  const reload = useCallback(() => {
    if (!ready) return;
    service.getModeratedPools(userId).then(setPools, (err) => {
      toast.error(resolveGroupPoolError(err).message);
      setPools((prev) => prev ?? []);
    });
  }, [ready, service, userId]);

  useEffect(() => {
    reload();
  }, [reload]);
  useRefetchOnFocus(reload, ready);

  if (pools === null) {
    return (
      <>
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />
        ))}
      </>
    );
  }

  if (pools.length === 0) {
    return (
      <GPCard className="flex flex-col items-center text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4 text-[#0D4F3C] dark:text-[#156B53]">
          <ShieldCheck className="w-7 h-7" strokeWidth={1.75} />
        </div>
        <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-1">Create your first pool</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[240px] leading-relaxed">
          Set the amount and size, lock your guarantee, then share the invite code with your group.
        </p>
        <button
          onClick={() => router.push("/moderator/create")}
          className="px-6 py-2.5 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-95 text-white font-bold text-xs rounded-full transition-all"
        >
          Create pool
        </button>
      </GPCard>
    );
  }

  const groups: [string, ModeratedPool[]][] = [
    ["Running", pools.filter((p) => p.status === "ACTIVE" || p.status === "PAUSED")],
    ["Forming", pools.filter((p) => p.status === "FORMING")],
    ["Ended", pools.filter((p) => p.status === "COMPLETED" || p.status === "CANCELLED")],
  ];
  const openCount = pools.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED").length;

  return (
    <>
      {maxPools > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
          {openCount} of {maxPools} pools in use
        </p>
      )}
      {groups.map(
        ([label, list]) =>
          list.length > 0 && (
            <section key={label} className="space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">{label}</h2>
              {list.map((pool, index) => (
                <ModeratedPoolCard key={pool.id} pool={pool} index={index} onOpen={() => router.push(`/moderator/pools/${pool.id}`)} />
              ))}
            </section>
          )
      )}
    </>
  );
}
