"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { useProfileService } from "@/services/profileService";
import { useKycService } from "@/services/kycService";
import { useUserService } from "@/services/userService";
import { isDevMode } from "@/lib/dev";
import {
  Users,
  Flame,
  TrendingUp,
  Shield,
  Medal,
  Share2,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";
import type { ProfileStats } from "@/services/profileService";
import type { UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
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
      setUserName(userProfile?.firstName || "****");
      setStats(profileStats);
      setKycStatus(kyc.status);

      console.log(profileStats);
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

  // const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";
  const userInitials = user?.firstName && user?.lastName
    ? (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()
    : userName.charAt(0).toUpperCase();

  const statCards = [
    { label: "Active pools", value: stats?.activePoolsCount ?? "—", icon: Users },
    { label: "Saving streak", value: stats?.savingStreak ?? "—", icon: Flame },
    { label: "Total saved", value: stats ? `GHS ${stats.totalSaved.toLocaleString()}` : "—", icon: TrendingUp },
    { label: "KYC status", value: kycStatus?.replace("_", " ") || "Not started", icon: Shield },
    { label: "Account tier", value: stats?.accountTier || "SILVER", icon: Medal },
    { label: "Referrals", value: stats?.referralCount ?? "—", icon: Share2 },
  ];

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-32 font-sans">
      <header className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white tracking-tight">Profile</h1>
        <button
          onClick={() => router.push("/settings")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20 hover:border-[#0D4F3C]/30 dark:hover:border-[#156B53]/30 transition-colors"
        >
          <Settings className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400" strokeWidth={1.75} />
        </button>
      </header>

      <main className="flex-1 px-5 space-y-5 max-w-xl mx-auto w-full">
        {/* ── IDENTITY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#151A1F] rounded-[24px] p-5 flex items-center gap-4 border border-black/[0.04] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
        >
          <div className="w-16 h-16 rounded-full bg-[#0D4F3C] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0C0F14] dark:text-white truncate">{userName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-[11px] font-bold">
                {stats?.accountTier || "SILVER"}
              </span>
              {stats?.reputationScore && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {stats.reputationScore}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── STAT GRID ── */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-[#151A1F] rounded-[20px] p-3.5 text-center border border-black/[0.04] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
              >
                <div className="w-9 h-9 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-[#0D4F3C] dark:text-[#156B53]" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-[#0C0F14] dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── REPUTATION ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#151A1F] rounded-[24px] p-5 border border-black/[0.04] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20"
          >
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Reputation</h3>
            <div className="space-y-4">
              {[
                { label: "Reliability", value: stats.reliabilityScore, max: 100 },
                { label: "Completion rate", value: stats.completionRate, max: 100 },
                { label: "Reputation", value: stats.reputationScore, max: 1000 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
                    <span className="text-[#0C0F14] dark:text-white font-bold">{item.value.toFixed(2)}/{item.max}</span>
                  </div>
                  <div className="h-1.5 bg-[#FBF6EF] dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D4F3C] rounded-full"
                      style={{ width: `${Math.min((item.value / item.max) * 100, 100).toFixed(2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      <Dock activeItem="profile" onItemClick={(href) => router.push(href)} />
    </div>
  );
}
