"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useProfileService } from "@/services/profileService";
import { useKycService } from "@/services/kycService";
import {
  Users,
  Flame,
  TrendingUp,
  Shield,
  Medal,
  Share2,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Dock } from "@/components/dashboard/Dock";
import type { ProfileStats } from "@/services/profileService";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const profileService = useProfileService();
  const kycService = useKycService();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileData = async () => {
    if (!userId) return;
    try {
      const [profileStats, kyc] = await Promise.all([
        profileService.getUserStats(userId),
        kycService.getStatus(userId).catch(() => ({ status: "NOT_SUBMITTED" })),
      ]);
      setStats(profileStats);
      setKycStatus(kyc.status);
    } catch {
      toast.error("Failed to load profile");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";
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
      <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] flex flex-col pb-32 font-sans">
      <header className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Profile</h1>
      </header>

      <main className="flex-1 px-5 space-y-5 max-w-xl mx-auto w-full">
        {/* ── IDENTITY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-5 flex items-center gap-4 border border-emerald-950/[0.04] shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-emerald-950 truncate">{userName}</h2>
            <p className="text-sm text-emerald-950/50 truncate">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">
                {stats?.accountTier || "SILVER"}
              </span>
              {stats?.reputationScore && (
                <span className="text-xs text-emerald-950/45">
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
                className="bg-white rounded-[20px] p-3.5 text-center border border-emerald-950/[0.04] shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-amber-700" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-emerald-950">{stat.value}</p>
                <p className="text-[10px] text-emerald-950/45 mt-0.5">{stat.label}</p>
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
            className="bg-white rounded-[24px] p-5 border border-emerald-950/[0.04] shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
          >
            <h3 className="text-xs font-bold text-emerald-950/50 uppercase tracking-wide mb-4">Reputation</h3>
            <div className="space-y-4">
              {[
                { label: "Reliability", value: stats.reliabilityScore, max: 100 },
                { label: "Completion rate", value: stats.completionRate, max: 100 },
                { label: "Reputation", value: stats.reputationScore, max: 1000 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-emerald-950/55 font-medium">{item.label}</span>
                    <span className="text-emerald-950 font-bold">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-1.5 bg-[#FBF6EF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full"
                      style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ACTIONS ── */}
        <div className="space-y-2.5">
          {[
            { label: "Settings", icon: Settings, href: "/settings" },
            { label: "KYC verification", icon: Shield, href: "/kyc" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center justify-between p-4 bg-white border border-emerald-950/[0.04] rounded-2xl hover:border-emerald-700/20 transition-colors shadow-[0_2px_8px_rgba(20,60,40,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] text-emerald-950/50" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-emerald-950">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-950/30" />
              </motion.button>
            );
          })}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100/70 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] text-red-600" strokeWidth={1.75} />
            <span className="text-sm font-medium text-red-600">Sign out</span>
          </motion.button>
        </div>
      </main>

      <Dock activeItem="profile" onItemClick={(href) => router.push(href)} />
    </div>
  );
}
