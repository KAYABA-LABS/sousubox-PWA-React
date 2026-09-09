"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePoolService } from "@/services/poolService";
import { PoolDetailModal } from "@/components/PoolDetailModal";
import { Users, Search, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isDevMode } from "@/lib/dev";
import type {
  ActivePoolListItem,
  JoinedPoolListItem,
  DiscoverPool,
  AvailablePoolDetails,
} from "@/lib/api";

type TabKey = "active" | "joined" | "discover";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PoolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
        </div>
      }
    >
      <PoolsHubContent />
    </Suspense>
  );
}

function PoolsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId =
    typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const poolService = usePoolService();

  const initialTab: TabKey = (() => {
    const t = searchParams.get("tab");
    return t === "joined" || t === "discover" ? t : "active";
  })();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const [activePools, setActivePools] = useState<ActivePoolListItem[] | null>(null);
  const [joinedPools, setJoinedPools] = useState<JoinedPoolListItem[] | null>(null);
  const [discoverPools, setDiscoverPools] = useState<DiscoverPool[] | null>(null);
  const [isActiveLoading, setIsActiveLoading] = useState(false);
  const [isJoinedLoading, setIsJoinedLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);

  const [modalListItem, setModalListItem] = useState<DiscoverPool | null>(null);
  const [modalDetails, setModalDetails] = useState<AvailablePoolDetails | null>(null);
  const [isLoadingModalDetails, setIsLoadingModalDetails] = useState(false);
  const [modalDetailsError, setModalDetailsError] = useState<string | null>(null);
  const [joiningPoolId, setJoiningPoolId] = useState<string | null>(null);

  const loadActive = async () => {
    if (!databaseUserId && !isDevMode()) return;
    setIsActiveLoading(true);
    try {
      setActivePools(await poolService.getActivePools(databaseUserId || ""));
    } catch {
      toast.error("Failed to load active pools");
      setActivePools([]);
    }
    setIsActiveLoading(false);
  };

  const loadJoined = async () => {
    if (!databaseUserId && !isDevMode()) return;
    setIsJoinedLoading(true);
    try {
      setJoinedPools(await poolService.getJoinedPools(databaseUserId || ""));
    } catch {
      toast.error("Failed to load joined pools");
      setJoinedPools([]);
    }
    setIsJoinedLoading(false);
  };

  const loadDiscover = async () => {
    if (!databaseUserId && !isDevMode()) return;
    setIsDiscoverLoading(true);
    try {
      setDiscoverPools(await poolService.getDiscoverPools(databaseUserId || ""));
    } catch {
      toast.error("Failed to discover pools");
      setDiscoverPools([]);
    }
    setIsDiscoverLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!databaseUserId && !isDevMode())) return;
    if (initialTab === "joined") loadJoined();
    else if (initialTab === "discover") loadDiscover();
    else loadActive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, databaseUserId]);

  const handleTabChange = (tab: string) => {
    const t = tab as TabKey;
    setActiveTab(t);
    if (t === "joined" && joinedPools === null) loadJoined();
    if (t === "discover" && discoverPools === null) loadDiscover();
    if (t === "active" && activePools === null) loadActive();
  };

  const openPoolDetails = async (pool: DiscoverPool) => {
    setModalListItem(pool);
    setModalDetails(null);
    setModalDetailsError(null);
    setIsLoadingModalDetails(true);
    try {
      const details = await poolService.getAvailablePoolDetails(databaseUserId || "", pool.id);
      setModalDetails(details);
    } catch (err) {
      setModalDetailsError(err instanceof Error ? err.message : "Failed to load pool details");
    }
    setIsLoadingModalDetails(false);
  };

  const handleJoin = async (poolId: string) => {
    if (!databaseUserId && !isDevMode()) return;
    setJoiningPoolId(poolId);
    try {
      await poolService.joinPool(databaseUserId || "", poolId);
      setDiscoverPools((prev) => (prev || []).filter((p) => p.id !== poolId));
      setModalListItem(null);
      setModalDetails(null);
      toast.success("Successfully joined pool");
      setJoinedPools(null);
      setActiveTab("joined");
      loadJoined();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join pool");
    }
    setJoiningPoolId(null);
  };

  const query = searchQuery.toLowerCase();
  const filteredActive = (activePools || []).filter((p) =>
    p.template.name.toLowerCase().includes(query)
  );
  const filteredJoined = (joinedPools || []).filter((p) =>
    p.template.name.toLowerCase().includes(query)
  );
  const filteredDiscover = (discoverPools || []).filter((p) =>
    p.template.name.toLowerCase().includes(query)
  );

  const searchPlaceholder =
    activeTab === "active"
      ? "Search active pools..."
      : activeTab === "joined"
        ? "Search joined pools..."
        : "Search available pools...";

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32 font-sans">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full"
      >
        <div className="mb-5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-semibold">Your finances</p>
          <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white tracking-tight">Pools</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 rounded-2xl text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:ring-2 focus:ring-[#0D4F3C]/10 dark:focus:ring-[#156B53]/10 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-black/10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full h-auto bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 rounded-full p-1 gap-1 justify-between">
            <TabsTrigger
              value="active"
              className="flex-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="joined"
              className="flex-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Joined
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="flex-1 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 data-[state=active]:bg-[#0D4F3C] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Discover
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.header>

      <div className="flex-1 px-5 max-w-xl mx-auto w-full">
        {activeTab === "active" && (
          <>
            {isActiveLoading && activePools === null ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
              </div>
            ) : filteredActive.length === 0 ? (
              <EmptyState
                message="No active pools yet"
                description="Join a collaborative rotating Susu pool to start saving with your community."
                onCta={() => handleTabChange("discover")}
              />
            ) : (
              <div className="space-y-3">
                {filteredActive.map((pool, index) => {
                  const percent = Math.min(Math.round((pool.currentCycle / pool.totalCycles) * 100), 100);
                  const isPaid = pool.contributionStatus?.toUpperCase().startsWith("COMPLETED");
                  return (
                    <motion.div
                      key={pool.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => router.push(`/pools/${pool.id}?type=active`)}
                      className="bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-5 cursor-pointer hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-all active:scale-[0.99] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white mb-1 truncate">
                            {pool.template.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-3">
                            {pool.template.tier} Tier
                          </p>
                          <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="font-bold text-[#0C0F14] dark:text-white">GHS {pool.contributionAmount}</span>
                            <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                            <span>Cycle {pool.currentCycle}/{pool.totalCycles}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}
                          >
                            {pool.contributionStatus}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/10 space-y-2">
                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                          <span>Next due: {formatDate(pool.nextContributionDue)}</span>
                          <span>{percent}% of cycle</span>
                        </div>
                        <div className="h-1.5 bg-[#FBF6EF] dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D4F3C] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "joined" && (
          <>
            {isJoinedLoading && joinedPools === null ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
              </div>
            ) : filteredJoined.length === 0 ? (
              <EmptyState
                message="No forming pools yet"
                description="Pools you join before they start show up here until they're full and go active."
                onCta={() => handleTabChange("discover")}
              />
            ) : (
              <div className="space-y-3">
                {filteredJoined.map((pool, index) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/pools/${pool.id}?type=joined`)}
                    className="bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-5 cursor-pointer hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-all active:scale-[0.99] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white mb-1 truncate">
                          {pool.template.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-3">
                          {pool.template.tier} Tier &middot; {pool.frequency}
                        </p>
                        <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="font-bold text-[#0C0F14] dark:text-white">GHS {pool.contributionAmount}</span>
                          <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                          <span>Payout GHS {pool.payoutAmount}</span>
                          <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                          <span>{pool.totalCycles} cycles</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          Forming
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {pool.currentMemberCount}/{pool.template.maxMembers}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold">
                        {pool.spotsRemaining} spots left
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "discover" && (
          <>
            {isDiscoverLoading && discoverPools === null ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
              </div>
            ) : filteredDiscover.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[28px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20">
                <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4 text-[#0D4F3C] dark:text-[#156B53]">
                  <Sparkles className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-1">No pools available</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed">
                  All pools are currently filled. Check back soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDiscover.map((pool, index) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openPoolDetails(pool)}
                    className="bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-5 cursor-pointer hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-all active:scale-[0.99] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-bold text-[#0C0F14] dark:text-white truncate">{pool.template.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-black/10 dark:border-white/10">
                            {pool.template.tier}
                          </span>
                        </div>
                        {pool.template.description && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {pool.template.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold">
                        {pool.spotsRemaining} spots left
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Pay</p>
                        <p className="text-xs font-bold text-[#0C0F14] dark:text-white">GHS {pool.contributionAmount}</p>
                      </div>
                      <div className="bg-[#D4A843]/10 dark:bg-[#D4A843]/15 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] font-semibold text-[#B58A28] dark:text-[#E2BB5C] uppercase tracking-wider mb-0.5">Payout</p>
                        <p className="text-xs font-bold text-[#B58A28] dark:text-[#E2BB5C]">GHS {pool.payoutAmount}</p>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Cycles</p>
                        <p className="text-xs font-bold text-[#0C0F14] dark:text-white">{pool.totalCycles}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/10 text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {pool.currentMemberCount}/{pool.template.maxMembers} members
                      </span>
                      <span className="flex items-center gap-1 text-[#0D4F3C] dark:text-[#156B53] font-bold">
                        View details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {modalListItem && (
        <PoolDetailModal
          listItem={modalListItem}
          details={modalDetails}
          isLoadingDetails={isLoadingModalDetails}
          detailsError={modalDetailsError}
          isOpen={!!modalListItem}
          onClose={() => {
            setModalListItem(null);
            setModalDetails(null);
            setModalDetailsError(null);
          }}
          onJoin={(poolId) => handleJoin(poolId)}
          isJoining={joiningPoolId === modalListItem.id}
        />
      )}

      <Dock activeItem="pools" onItemClick={(href) => router.push(href)} />
    </main>
  );
}

function EmptyState({
  message,
  description,
  onCta,
}: {
  message: string;
  description: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[28px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20">
      <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4 text-[#0D4F3C] dark:text-[#156B53]">
        <Users className="w-7 h-7" strokeWidth={1.75} />
      </div>
      <h2 className="text-base font-bold text-[#0C0F14] dark:text-white mb-1">{message}</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[220px] leading-relaxed">{description}</p>
      <button
        onClick={onCta}
        className="px-6 py-2.5 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-95 text-white font-bold text-xs rounded-full transition-all"
      >
        Find a pool
      </button>
    </div>
  );
}
