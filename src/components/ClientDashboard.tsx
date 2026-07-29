"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  CreditCard,
  ShieldAlert,
  Calendar,
  Lock,
  Flag,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Dock } from "@/components/dashboard/Dock";
import { usePoolService } from "@/services/poolService";
import { useSavingsService } from "@/services/savingsService";
import { useKycService } from "@/services/kycService";
import { api, type UserPoolMembership, type SavingsGoal, type UserProfile } from "@/lib/api";

// ─── SVG Progress Ring Component ──────────────────────────────────────────────
interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  isDark?: boolean;
}

function CircularProgress({
  percent,
  size = 40,
  strokeWidth = 3.5,
  color = "#10b981",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-95" width={size} height={size}>
        {/* Background track */}
        <circle
          className="text-white/10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress indicator */}
        <circle
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute text-[10px] font-bold text-white">{percent}%</div>
    </div>
  );
}

export default function ClientDashboard() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const poolService = usePoolService();
  const savingsService = useSavingsService();
  const kycService = useKycService();

  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);

  // Live Backend State
  const [pools, setPools] = useState<UserPoolMembership[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push("/signin");
      return;
    }

    const displayName =
      (user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName) ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "User";

    setUserName(displayName);

    // Fetch live backend data
    const fetchBackendData = async () => {
      try {
        const [poolsData, savingsData, kycStatusData, profileData] = await Promise.all([
          poolService.getUserPools(userId),
          savingsService.getSavingsGoals(userId),
          kycService.getStatus(userId),
          api.getUserProfile(userId).catch(() => null),
        ]);

        setPools(poolsData || []);
        setSavings(savingsData || []);
        
        const kycPassed = kycStatusData?.status === "VERIFIED";
        setIsKycVerified(kycPassed);

        if (profileData && profileData.data) {
          setProfile(profileData.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();

    // Welcome alerts from verification success redirect
    const wasVerified =
      searchParams?.get("verified") === "true" ||
      sessionStorage.getItem("verified") === "true";

    if (wasVerified) {
      setShowWelcome(true);
      setIsKycVerified(true);
      if (sessionStorage.getItem("verified") === "true") {
        sessionStorage.removeItem("verified");
      }
    }
  }, [userId, isLoaded, user, router, searchParams]);

  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const handleDeposit = () => router.push("/deposit");
  const handleWithdraw = () => router.push("/withdraw");
  const handleTransfer = () => router.push("/transfer");
  const handlePay = () => router.push("/pay");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E660]" />
      </div>
    );
  }

  // Calculate totals from live profile stats or dynamic states
  const totalLockedInPools = pools.reduce((acc, p) => acc + (p.totalContributed || 0), 0);
  const totalPersonalSavings = savings.reduce((acc, s) => acc + (s.balance || 0), 0);
  
  // Available balance falls back to profile stat totalAmountSaved or remains computed
  const availableBalance = profile?.stats?.totalAmountSaved 
    ? profile.stats.totalAmountSaved - totalLockedInPools - totalPersonalSavings
    : 4300; // fallback cash for sandbox testing

  const totalBalance = availableBalance + totalLockedInPools + totalPersonalSavings;

  // Detect if any pool has due/overdue status
  const dueSoon = pools.find(
    (p) => p.pool.status === "DUE" || p.pool.status === "OVERDUE" || p.pool.status === "due"
  );

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white flex flex-col pb-32 relative overflow-hidden font-sans">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="px-5 pt-6 pb-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00E660] to-[#00B84D] border border-white/10 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-emerald-500/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">Akwaaba</p>
              <p className="text-base font-bold text-white flex items-center gap-1">
                {userName}
                {isKycVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/activity")}
            className="w-10 h-10 rounded-xl bg-[#1C202B] hover:bg-[#252A39] flex items-center justify-center border border-white/5 relative transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-[#0C0F14]" />
          </button>
        </div>
      </header>

      {/* ── ALERTS (Welcome or Status) ── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-5 mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Verification complete!</span> Welcome aboard SusuChain.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 px-5 space-y-6 z-10 max-w-xl mx-auto w-full">
        {/* ── KYC VERIFICATION PROMPT ── */}
        {!isKycVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-[#1C1810] to-[#120F0A] relative overflow-hidden"
          >
            <div className="absolute top-[-40px] right-[-40px] w-24 h-24 rounded-full bg-amber-500/5 blur-xl" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-400">Complete KYC Verification</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Verify your identity to unlock group savings circles, deposits, transfers, and platinum access.
                </p>
                <button
                  onClick={() => router.push("/kyc")}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/15"
                >
                  Start Verification
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BALANCE CARD (Premium Deco Ring Design) ── */}
        <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${!isKycVerified ? "opacity-60" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#08362A] via-[#0D4F3C] to-[#156B53] z-0" />
          
          {/* Custom SVG Rings matching mobile deco */}
          <div className="absolute right-[-40px] top-[-40px] w-[180px] h-[180px] rounded-full bg-yellow-500/10 z-0" />
          <svg className="absolute left-[-20px] bottom-[-40px] w-[160px] h-[160px] opacity-10 text-white z-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </svg>

          <div className="relative p-6 space-y-6 z-10">
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">Available Balance</span>
                <h1 className="text-3xl font-black tracking-tight text-white">
                  GHS {totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h1>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[9px] font-black text-yellow-100 tracking-wider">
                  {isKycVerified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            </div>

            {/* Split Locked Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Locked in Pools</span>
                </div>
                <p className="text-sm font-bold text-white">
                  GHS {totalLockedInPools.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="border-l border-white/10 pl-4 space-y-0.5">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Personal Savings</span>
                </div>
                <p className="text-sm font-bold text-white">
                  GHS {totalPersonalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Quick Action Rows */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <QuickActionButton icon={ArrowDown} label="Deposit" onClick={handleDeposit} enabled={isKycVerified} />
              <QuickActionButton icon={ArrowUp} label="Withdraw" onClick={handleWithdraw} enabled={isKycVerified} />
              <QuickActionButton icon={ArrowRightLeft} label="Transfer" onClick={handleTransfer} enabled={isKycVerified} />
              <QuickActionButton icon={CreditCard} label="Pay" onClick={handlePay} enabled={isKycVerified} />
            </div>
          </div>
        </div>

        {/* ── DUE SOON BANNER ── */}
        {isKycVerified && dueSoon && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#F6E9C4]/15 to-[#F6E9C4]/5 border border-yellow-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black shrink-0 shadow-lg shadow-yellow-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wide">Settle Up</h4>
              <p className="text-xs text-white/80 font-medium truncate mt-0.5">
                {dueSoon.pool.template.name} — contribution due soon
              </p>
            </div>
            <button
              onClick={() => router.push(`/pools/${dueSoon.pool.id}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-black font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* ── ACTIVE POOLS (Susu Circles) ── */}
        {isKycVerified && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">My Active Pools</h2>
              <button onClick={() => router.push("/pools")} className="text-xs font-semibold text-[#00E660] hover:underline">
                See all
              </button>
            </div>

            {pools.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {pools.map((membership) => {
                  const pool = membership.pool;
                  const percent = Math.round((pool.currentMemberCount / pool.maxMembers) * 100);
                  return (
                    <div
                      key={pool.id}
                      onClick={() => router.push(`/pools/${pool.id}`)}
                      className="w-[240px] shrink-0 snap-start bg-[#161A24] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors cursor-pointer space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 max-w-[140px]">
                          <h4 className="text-xs font-bold text-white truncate">{pool.template.name}</h4>
                          <p className="text-[10px] text-gray-500">
                            Cycle {pool.currentCycle} of {pool.totalCycles}
                          </p>
                        </div>
                        <CircularProgress percent={percent} size={38} color="#00E660" />
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-gray-500 uppercase font-medium">Contribution</span>
                          <p className="text-xs font-extrabold text-white">
                            GHS {pool.contributionAmount}
                            <span className="text-[10px] text-gray-500 font-normal">/{pool.frequency}</span>
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full ${
                            pool.status === "DUE" || pool.status === "due"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {pool.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-[#161A24] rounded-2xl border border-white/5 text-center">
                <Users className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">You are not in any savings circles yet.</p>
                <button
                  onClick={() => router.push("/pools/discover")}
                  className="mt-3 text-xs font-black text-[#00E660]"
                >
                  Join a Pool
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SAVINGS GOALS (Personal) ── */}
        {isKycVerified && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">My Savings Goals</h2>
              <button
                onClick={() => router.push("/settings/personal")}
                className="text-xs font-semibold text-[#00E660] hover:underline"
              >
                New goal
              </button>
            </div>

            {savings.length > 0 ? (
              <div className="space-y-2">
                {savings.map((goal) => {
                  const percent = goal.target > 0 ? Math.round((goal.balance / goal.target) * 100) : 0;
                  return (
                    <div
                      key={goal.id}
                      onClick={() => router.push("/settings/personal")}
                      className="bg-[#161A24] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors cursor-pointer space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          {goal.type === "AUTOSAVE" ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{goal.name}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {goal.type} · Next in {goal.dueDays || "no"} days
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-white">{percent}%</span>
                          <p className="text-[10px] text-gray-500 mt-0.5">GHS {goal.balance}</p>
                        </div>
                      </div>
                      {/* Linear Progress Bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-[#161A24] rounded-2xl border border-white/5 text-center">
                <Flag className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No personal savings goals set yet.</p>
                <button
                  onClick={() => router.push("/settings/personal")}
                  className="mt-3 text-xs font-black text-[#00E660]"
                >
                  Create Savings Plan
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── NAVIGATION DOCK ── */}
      <Dock activeItem="home" onItemClick={(href) => router.push(href)} />
    </div>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  enabled: boolean;
}

function QuickActionButton({ icon: Icon, label, onClick, enabled }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all ${
        enabled
          ? "bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer"
          : "bg-white/2 opacity-40 cursor-not-allowed"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
      </div>
      <span className="text-[10px] text-white/80 font-semibold">{label}</span>
    </button>
  );
}
