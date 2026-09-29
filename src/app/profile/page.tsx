"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useProfileService } from "@/services/profileService";
import { useKycService } from "@/services/kycService";
import { useUserService } from "@/services/userService";
import { isDevMode } from "@/lib/dev";
import {
  Users,
  Flame,
  Coins,
  PiggyBank,
  Flag,
  Sparkles,
  Settings,
  Loader2,
  Plus,
  User,
  CheckCircle2,
  Bell,
  Lock,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProfileStats } from "@/services/profileService";
import type { UserProfile } from "@/lib/api";

const cardClass =
  "bg-[#FFFEFB] dark:bg-[#151A1F] rounded-2xl border border-[#E8E3D7] dark:border-white/10 shadow-[0_1px_0_rgba(26,35,50,0.02),0_1px_2px_rgba(26,35,50,0.04),0_4px_14px_rgba(26,35,50,0.04)] dark:shadow-black/20";

const TIER_TONES: Record<string, string> = {
  Silver: "bg-[#EDEEF1] text-[#5A6273] border-[#A8AEBB]/20 [--dot:#A8AEBB]",
  Platinum: "bg-[#E6EEEC] text-[#0D4F3C] border-[#0D4F3C]/20 [--dot:#0D4F3C]",
  Gold: "bg-[#FBF4DF] text-[#B58A28] border-[#D4A843]/20 [--dot:#D4A843]",
};

function TierBadge({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  const tone = TIER_TONES[label] || TIER_TONES.Silver;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-full border ${tone}`}>
      <span className="w-[7px] h-[7px] rounded-full bg-[var(--dot)]" />
      {label}
    </span>
  );
}

function Gauge({ value, size = 200, children }: { value: number; size?: number; children: React.ReactNode }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cy = size / 2;
  const circ = Math.PI * r;
  const v = Math.min(Math.max(value, 0), 1);
  const arc = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${cy}`;
  const height = size / 2 + 20;
  return (
    <div className="relative" style={{ width: size, height }}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} role="img" aria-label={`Score ${Math.round(v * 100)} of 100`}>
        <path d={arc} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-[#E8E3D7] dark:stroke-white/10" />
        <motion.path
          d={arc}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-[#0D4F3C] dark:stroke-[#156B53]"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${circ * v} ${circ}` }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 top-[18px] flex flex-col items-center justify-end">{children}</div>
    </div>
  );
}

function reliabilityLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs improvement";
}

export default function ProfilePage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const profileService = useProfileService();
  const userService = useUserService();
  const kycService = useKycService();

  const [userName, setUserName] = useState("******");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileData = async () => {
    if (!userId && !isDevMode()) return;
    try {
      const [userProfile, profileStats, kyc] = await Promise.all([
        userService.getUserProfile(userId || "").catch(() => null),
        profileService.getUserStats(userId || ""),
        kycService.getStatus(userId || "").catch(() => ({ status: "NOT_SUBMITTED" })),
      ]);
      setProfile(userProfile);
      setUserName(
        [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || "****"
      );
      setStats(profileStats);
      setKycStatus(kyc.status);
    } catch {
      toast.error("Failed to load profile");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    loadProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || "?";

  const memberSince = profile?.createdAt
    ? `Since ${new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
    : null;

  const reliability = Math.round(stats?.reliabilityScore ?? 0);

  const kycLabel = kycStatus
    ? kycStatus === "NOT_SUBMITTED"
      ? "Not started"
      : kycStatus.charAt(0) + kycStatus.slice(1).toLowerCase().replace(/_/g, " ")
    : "Not started";

  const statCards = [
    { label: "Total saved", value: stats ? `GHS ${stats.totalSaved.toLocaleString()}` : "—", icon: Coins, color: "text-[#0D4F3C] dark:text-[#1F8C6C]" },
    { label: "Total earned", value: stats ? `GHS ${stats.totalEarned.toLocaleString()}` : "—", icon: PiggyBank, color: "text-pink-500 dark:text-pink-400" },
    { label: "Pools completed", value: profile?.stats?.poolsCompleted ?? "—", icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Goals achieved", value: profile?.stats?.personalInstrumentsCompleted ?? "—", icon: Flag, color: "text-violet-600 dark:text-violet-400" },
    { label: "Contribution streak", value: stats ? `${stats.savingStreak} wks` : "—", icon: Flame, color: "text-orange-500 dark:text-orange-400" },
    { label: "Reputation", value: stats?.reputationScore ?? "—", icon: Sparkles, color: "text-amber-500 dark:text-amber-400" },
  ];


  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F14] text-[#1A2332] dark:text-white flex flex-col pb-32 font-sans antialiased">
      {/* ── NAV BAR ── */}
      <header className="px-3.5 pt-2 pb-2.5 max-w-xl mx-auto w-full flex items-center justify-between">
        <div className="w-11" />
        <h1 className="text-base font-bold tracking-tight">Profile</h1>
        <button
          onClick={() => router.push("/settings")}
          aria-label="Settings"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FFFEFB] dark:bg-[#151A1F] border border-[#E8E3D7] dark:border-white/10 text-[#3B4759] dark:text-gray-300 hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-colors"
        >
          <Settings className="w-[17px] h-[17px]" strokeWidth={1.6} />
        </button>
      </header>

      <main className="flex-1 px-4 max-w-xl mx-auto w-full">
        {/* ── IDENTITY ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1 flex flex-col items-center text-center"
        >
          <button
            onClick={() => router.push("/settings/photo")}
            aria-label="Change profile photo"
            className="relative rounded-full"
          >
            <Avatar className="w-20 h-20">
              {profile?.photoUrl && (
                <AvatarImage src={profile.photoUrl} alt={userName} className="object-cover" />
              )}
              <AvatarFallback className="bg-gradient-to-br from-[#0D4F3C] to-[#156B53] text-white text-[30px] font-bold select-none">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full bg-[#0D4F3C] text-white border-[2.5px] border-[#F7F5F0] dark:border-[#0C0F14] flex items-center justify-center">
              <Plus className="w-[13px] h-[13px]" strokeWidth={2.4} />
            </span>
          </button>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight">{userName}</h2>
          <p className="mt-0.5 text-[13px] text-[#6E788A] dark:text-gray-400">
            {[profile?.username && `@${profile.username}`, memberSince].filter(Boolean).join(" · ") ||
              user?.emailAddresses?.[0]?.emailAddress}
          </p>
          <div className="mt-2.5">
            <TierBadge tier={stats?.accountTier || "SILVER"} />
          </div>
        </motion.div>

        {/* ── RELIABILITY GAUGE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${cardClass} mt-4 px-4 pt-[18px] pb-4 flex flex-col items-center`}
        >
          <Gauge value={reliability / 100}>
            <div className="text-[40px] leading-none font-extrabold tabular-nums">{stats ? reliability : "—"}</div>
            <div className="text-[11px] font-semibold text-[#6E788A] dark:text-gray-400">Reliability score</div>
          </Gauge>
          {stats && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0D4F3C] dark:text-[#1F8C6C]">
              <span className="w-[7px] h-[7px] rounded-full bg-current" />
              {reliabilityLabel(reliability)}
            </div>
          )}
        </motion.div>

        {/* ── STAT GRID ── */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
                className={`${cardClass} px-3 py-[18px] min-w-0`}
              >
                <Icon className={`w-[17px] h-[17px] ${stat.color}`} strokeWidth={1.6} />
                <p className="mt-2 text-[15px] font-bold tracking-tight tabular-nums truncate">{stat.value}</p>
                <p className="mt-0.5 text-[10.5px] leading-tight text-[#6E788A] dark:text-gray-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

      </main>

      <Dock activeItem="profile" onItemClick={(href) => router.push(href)} />
    </div>
  );
}
