"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePoolService } from "@/services/poolService";
import { ApiError } from "@/lib/api";
import type { ActivePoolDetails, JoinedPoolDetails, PoolMemberRef } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { ArrowLeft, Users, Calendar, Loader2, Award, Landmark, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

function memberName(user: PoolMemberRef) {
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.username;
}

function formatLongDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function PoolDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
        </div>
      }
    >
      <PoolDetailContent />
    </Suspense>
  );
}

function PoolDetailContent() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId =
    typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const poolService = usePoolService();

  const [viewMode, setViewMode] = useState<"active" | "joined" | null>(null);
  const [activeDetails, setActiveDetails] = useState<ActivePoolDetails | null>(null);
  const [joinedDetails, setJoinedDetails] = useState<JoinedPoolDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || (!databaseUserId && !isDevMode()) || !poolId) return;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        if (typeParam === "joined") {
          setJoinedDetails(await poolService.getJoinedPoolDetails(databaseUserId || "", poolId));
          setViewMode("joined");
        } else {
          try {
            setActiveDetails(await poolService.getActivePoolDetails(databaseUserId || "", poolId));
            setViewMode("active");
          } catch (err) {
            if (typeParam === "active") throw err;
            const code = err instanceof ApiError ? err.code : undefined;
            if (code === "POOL_NOT_ACTIVE_YET" || code === "POOL_NOT_ACTIVE") {
              setJoinedDetails(await poolService.getJoinedPoolDetails(databaseUserId || "", poolId));
              setViewMode("joined");
            } else {
              throw err;
            }
          }
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load pool details");
        toast.error("Failed to load pool details");
      }
      setIsLoading(false);
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, databaseUserId, poolId, typeParam]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (loadError || !viewMode) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] flex flex-col items-center justify-center p-6 text-center">
        <Landmark className="w-12 h-12 text-emerald-950/30 mb-4" />
        <p className="text-lg font-bold text-emerald-950">Pool Not Found</p>
        <p className="text-sm text-emerald-950/50 mt-1 mb-6">
          {loadError || "The requested pool does not exist or you lack permission to view it."}
        </p>
        <button
          onClick={() => router.push("/pools")}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-full transition-all"
        >
          Back to Pools
        </button>
      </div>
    );
  }

  return viewMode === "active" && activeDetails ? (
    <ActiveView details={activeDetails} onBack={() => router.back()} onContribute={() => router.push(`/pools/${poolId}/contribute`)} />
  ) : joinedDetails ? (
    <JoinedView details={joinedDetails} onBack={() => router.back()} />
  ) : null;
}

function StatTile({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${accent ? "bg-emerald-50 border border-emerald-100" : "bg-[#FBF6EF] border border-emerald-950/[0.04]"}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${accent ? "text-emerald-700" : "text-emerald-950/40"}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-sm font-bold ${accent ? "text-emerald-700" : "text-emerald-950"}`}>{value}</p>
    </div>
  );
}

function DetailHeader({ title, badgeLabel, badgeTone, onBack }: { title: string; badgeLabel: string; badgeTone: "emerald" | "amber"; onBack: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white border border-emerald-950/10 flex items-center justify-center shrink-0 hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-950" />
        </button>
        <h1 className="text-lg font-bold text-emerald-950 tracking-tight">{title}</h1>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
          badgeTone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {badgeLabel}
      </span>
    </motion.header>
  );
}

function ActiveView({
  details,
  onBack,
  onContribute,
}: {
  details: ActivePoolDetails;
  onBack: () => void;
  onContribute: () => void;
}) {
  const percent = Math.min(Math.round((details.currentCycle / details.totalCycles) * 100), 100);
  const memberRows = Array.isArray(details.members) ? details.members : [];

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] flex flex-col pb-36 font-sans">
      <DetailHeader
        title={details.nickname}
        badgeLabel={details.healthLabel === "ON_TRACK" ? "On Track" : "At Risk"}
        badgeTone={details.healthLabel === "ON_TRACK" ? "emerald" : "amber"}
        onBack={onBack}
      />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)] relative overflow-hidden">
          <Award className="w-20 h-20 text-emerald-700/[0.06] absolute -top-3 -right-3" />
          <p className="text-[10px] text-emerald-950/40 uppercase tracking-wider font-semibold mb-1">{details.tier} Tier</p>
          <p className="text-2xl font-bold text-emerald-950 mb-4">
            {details.cyclePot.currency} {details.cyclePot.amount}
            <span className="text-xs font-medium text-emerald-950/40 ml-1">this cycle&apos;s pot</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Calendar} label="Cycle" value={`${details.currentCycle}/${details.totalCycles}`} />
            <StatTile icon={Users} label="Contributed" value={`${details.contributedCount}/${details.totalMembers}`} accent />
            <StatTile icon={Calendar} label="Days Left" value={details.daysLeftInCycle ?? "—"} />
          </div>
        </div>

        <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Cycle Progress</h3>
            <span className="text-xs font-bold text-emerald-700">{percent}%</span>
          </div>
          <div className="h-2 bg-[#FBF6EF] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-700 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {details.myContribution && (
          <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">My Contribution</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-950/60">Amount</span>
              <span className="text-sm font-bold text-emerald-950">GHS {details.myContribution.amount}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-emerald-950/60">Status</span>
              <span className={`text-xs font-bold uppercase ${details.myContribution.paidThisCycle ? "text-emerald-700" : "text-amber-700"}`}>
                {details.myContribution.status}
              </span>
            </div>
          </div>
        )}

        {details.payoutTimeline.length > 0 && (
          <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">Payout Timeline</h3>
            <div className="space-y-2">
              {details.payoutTimeline.map((entry) => (
                <div key={entry.cycleNumber} className="flex items-center justify-between py-2 border-b border-emerald-950/[0.04] last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#FBF6EF] text-[10px] font-bold text-emerald-950/60 flex items-center justify-center shrink-0">
                      {entry.cycleNumber}
                    </span>
                    <span className="text-sm text-emerald-950/70 truncate">{memberName(entry.user)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-emerald-950">GHS {entry.amount}</span>
                    {entry.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.contributionTimeline.length > 0 && (
          <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">Contribution Timeline</h3>
            <div className="space-y-2">
              {details.contributionTimeline.map((entry, i) => (
                <div
                  key={`${entry.cycleNumber}-${entry.user.id}-${i}`}
                  className={`flex items-center justify-between py-2 border-b border-emerald-950/[0.04] last:border-0 ${entry.isMine ? "bg-emerald-50/50 -mx-2 px-2 rounded-lg" : ""}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#FBF6EF] text-[10px] font-bold text-emerald-950/60 flex items-center justify-center shrink-0">
                      {entry.cycleNumber}
                    </span>
                    <span className="text-sm text-emerald-950/70 truncate">
                      {entry.isMine ? "You" : memberName(entry.user)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-emerald-950">GHS {entry.amount}</span>
                    {entry.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {memberRows.length > 0 && (
          <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">Members</h3>
            <p className="text-xs text-emerald-950/50">
              {details.contributedCount} of {details.totalMembers} members have contributed this cycle.
            </p>
          </div>
        )}
      </div>

      {details.myContribution && !details.myContribution.paidThisCycle && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-[#FBF6EF]/95 backdrop-blur-xl border-t border-emerald-950/[0.06] z-30">
          <div className="max-w-xl mx-auto">
            <button
              onClick={onContribute}
              className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold rounded-2xl transition-all"
            >
              Contribute GHS {details.myContribution.amount}
            </button>
          </div>
        </div>
      )}

      {details.myContribution?.paidThisCycle && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-[#FBF6EF]/95 backdrop-blur-xl border-t border-emerald-950/[0.06] z-30">
          <div className="max-w-xl mx-auto flex items-center justify-center gap-2 h-14 bg-emerald-50 text-emerald-700 font-bold rounded-2xl">
            <CheckCircle2 className="w-5 h-5" /> Paid for this cycle
          </div>
        </div>
      )}
    </main>
  );
}

function JoinedView({ details, onBack }: { details: JoinedPoolDetails; onBack: () => void }) {
  const startLabel = formatLongDate(details.startDate);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] flex flex-col pb-16 font-sans">
      <DetailHeader title={details.template.name} badgeLabel="Forming" badgeTone="amber" onBack={onBack} />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
          <p className="text-[10px] text-emerald-950/40 uppercase tracking-wider font-semibold mb-1">{details.template.tier} Tier</p>
          {details.template.description && (
            <p className="text-sm text-emerald-950/60 leading-relaxed mb-4">{details.template.description}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Landmark} label="Contribution" value={`GHS ${details.contributionAmount}`} />
            <StatTile icon={Landmark} label="Payout" value={`GHS ${details.payoutAmount}`} accent />
            <StatTile icon={Calendar} label="Cycles" value={details.totalCycles} />
          </div>
        </div>

        <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">Membership</h3>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-emerald-950/60">Joined</span>
            <span className="text-sm font-semibold text-emerald-950">{formatLongDate(details.joinedAt) || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-emerald-950/60">Status</span>
            <span className="text-sm font-semibold text-emerald-950">{details.memberStatus}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-emerald-950/60">Entry fee</span>
            <span className="text-sm font-semibold text-emerald-950">GHS {details.template.joiningFee}</span>
          </div>
        </div>

        <div className="bg-white border border-emerald-950/[0.04] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(20,60,40,0.06)]">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-3">Capacity</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-sm text-emerald-950/60">
              <Users className="w-4 h-4" /> {details.currentMemberCount}/{details.template.maxMembers} members
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {details.spotsRemaining} spots left
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-emerald-950 font-medium">
                {startLabel ? `Starts on ${startLabel}` : "Start date to be confirmed once the pool fills"}
              </p>
              <p className="text-xs text-emerald-950/50 mt-1">
                You&apos;ll be notified once this pool activates and your first contribution becomes due.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
