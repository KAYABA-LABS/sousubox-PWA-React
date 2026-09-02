"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  CreditCard,
  ShieldAlert,
  Calendar,
  Lock,
  ChevronRight,
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

export default function ClientDashboard() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId =
    typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
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
          poolService.getUserPools(databaseUserId || ""),
          savingsService.getSavingsGoals(databaseUserId || ""),
          kycService.getStatus(databaseUserId || ""),
          api.getUserProfile(databaseUserId || "").catch(() => null),
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
      <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
      </div>
    );
  }

  // Calculate totals from live profile stats or dynamic states
  const totalLockedInPools = pools.reduce((acc, p) => acc + (p.totalContributed || 0), 0);
  const totalPersonalSavings = savings.reduce((acc, s) => acc + (s.balance || 0), 0);

  // Do not invent a balance when the backend has not returned one.
  const availableBalance = profile?.stats?.totalAmountSaved
    ? profile.stats.totalAmountSaved - totalLockedInPools - totalPersonalSavings
    : 0;

  const totalBalance = availableBalance + totalLockedInPools + totalPersonalSavings;

  // Detect if any pool has due/overdue status
  const dueSoon = pools.find(
    (p) => p.pool.status === "DUE" || p.pool.status === "OVERDUE" || p.pool.status === "due"
  );

  return (
    <div className="min-h-screen bg-[#FBF6EF] flex flex-col pb-32 font-sans">
      {/* ── HEADER ── */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-emerald-950/45 tracking-widest uppercase font-semibold">Akwaaba</p>
              <p className="text-base font-bold text-emerald-950 flex items-center gap-1.5">
                {userName}
                {isKycVerified && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/activity")}
            className="w-10 h-10 rounded-full bg-white hover:bg-emerald-50 flex items-center justify-center border border-emerald-950/[0.06] relative transition-colors shadow-[0_1px_3px_rgba(20,60,40,0.06)]"
          >
            <Bell className="w-[18px] h-[18px] text-emerald-950/60" strokeWidth={1.75} />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 border-2 border-white" />
          </button>
        </div>
      </header>

      {/* ── ALERTS (Welcome or Status) ── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mx-5 mb-4 max-w-xl lg:mx-auto w-auto lg:w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-700" />
            <div className="text-sm">
              <span className="font-semibold">Verification complete!</span> Welcome aboard SusuChain.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 px-5 space-y-5 max-w-xl mx-auto w-full">
        {/* ── KYC VERIFICATION PROMPT ── */}
        {!isKycVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] p-5 bg-white border border-emerald-950/[0.04] shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldAlert className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-950">Complete KYC verification</h3>
                <p className="text-[13px] text-emerald-950/55 leading-relaxed">
                  Verify your identity to unlock group savings circles, deposits, transfers, and platinum access.
                </p>
                <button
                  onClick={() => router.push("/kyc")}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-full transition-all"
                >
                  Start verification
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BALANCE CARD ── */}
        <div className={`relative rounded-[28px] overflow-hidden shadow-[0_4px_16px_rgba(20,60,40,0.12),0_16px_40px_rgba(20,60,40,0.10)] transition-opacity duration-300 ${!isKycVerified ? "opacity-60" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 z-0" />

          {/* Decorative rings, kept subtle against the new base */}
          <div className="absolute right-[-40px] top-[-40px] w-[180px] h-[180px] rounded-full bg-amber-400/10 z-0" />
          <svg className="absolute left-[-20px] bottom-[-40px] w-[160px] h-[160px] opacity-[0.08] text-white z-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </svg>

          <div className="relative p-6 space-y-6 z-10">
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-white/65 uppercase tracking-widest font-semibold">Available balance</span>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  GHS {totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/25 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <span className="text-[9px] font-bold text-amber-100 tracking-wider">
                  {isKycVerified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            </div>

            {/* Split Locked Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Locked in pools</span>
                </div>
                <p className="text-sm font-bold text-white">
                  GHS {totalLockedInPools.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="border-l border-white/15 pl-4 space-y-0.5">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Personal savings</span>
                </div>
                <p className="text-sm font-bold text-white">
                  GHS {totalPersonalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Quick Action Row */}
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
          <div className="rounded-[24px] p-4 bg-white border border-emerald-950/[0.04] shadow-[0_2px_8px_rgba(20,60,40,0.06)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">Settle up</h4>
              <p className="text-xs text-emerald-950/55 font-medium truncate mt-0.5">
                {dueSoon.pool.template.name} — contribution due soon
              </p>
            </div>
            <button
              onClick={() => router.push(`/pools/${dueSoon.pool.id}`)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-full transition-all shrink-0"
            >
              Pay now
            </button>
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
          ? "bg-white/10 hover:bg-white/15 active:scale-95 cursor-pointer"
          : "bg-white/5 opacity-40 cursor-not-allowed"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
      </div>
      <span className="text-[10px] text-white/85 font-semibold">{label}</span>
    </button>
  );
}
