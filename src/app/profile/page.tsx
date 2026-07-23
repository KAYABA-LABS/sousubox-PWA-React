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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
    { label: "Active Pools", value: stats?.activePoolsCount ?? "—", icon: Users, color: "#3B82F6" },
    { label: "Saving Streak", value: stats?.savingStreak ?? "—", icon: Flame, color: "#F59E0B" },
    { label: "Total Saved", value: stats ? `$${stats.totalSaved.toLocaleString()}` : "—", icon: TrendingUp, color: "#10B981" },
    { label: "KYC Status", value: kycStatus?.replace("_", " ") || "Not Started", icon: Shield, color: "#8B5CF6" },
    { label: "Account Tier", value: stats?.accountTier || "SILVER", icon: Medal, color: "#EF4444" },
    { label: "Referrals", value: stats?.referralCount ?? "—", icon: Share2, color: "#06B6D4" },
  ];

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </motion.header>

      <main className="flex-1 px-5 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-gray-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-black text-xl font-bold">
              {userInitials}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
              <p className="text-sm text-gray-500">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                  {stats?.accountTier || "SILVER"}
                </Badge>
                {stats?.reputationScore && (
                  <span className="text-xs text-gray-500">
                    Score: {stats.reputationScore}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white border-gray-200 rounded-2xl p-3 text-center">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Reputation</h3>
              <div className="space-y-3">
                {[
                  { label: "Reliability", value: stats.reliabilityScore, max: 100 },
                  { label: "Completion Rate", value: stats.completionRate, max: 100 },
                  { label: "Reputation", value: stats.reputationScore, max: 1000 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-gray-900">{item.value}/{item.max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <div className="space-y-2">
          {[
            { label: "Settings", icon: Settings, href: "/settings" },
            { label: "KYC Verification", icon: Shield, href: "/kyc" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Button>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-500">Sign Out</span>
            </Button>
          </motion.div>
        </div>
      </main>
    </main>
  );
}
