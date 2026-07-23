"use client";

import { api } from "@/lib/api";

export interface ProfileStats {
  totalContributions: number;
  totalPayouts: number;
  totalSaved: number;
  totalEarned: number;
  savingStreak: number;
  activePoolsCount: number;
  referralCount: number;
  accountTier: string;
  reputationScore: number;
  reliabilityScore: number;
  completionRate: number;
}

export function useProfileService() {
  return {
    getUserStats: async (userId: string): Promise<ProfileStats> => {
      try {
        const result = await api.getUserProfile(userId);
        const profile = result.data;
        const stats = profile?.stats;

        return {
          totalContributions: stats?.totalContributions || 0,
          totalPayouts: stats?.totalPayouts || 0,
          totalSaved: stats?.totalAmountSaved || 0,
          totalEarned: stats?.totalAmountEarned || 0,
          savingStreak: stats?.currentStreak || 0,
          activePoolsCount: stats?.poolsJoined || 0,
          referralCount: stats?.followersCount || 0,
          accountTier: profile?.tier || "SILVER",
          reputationScore: stats?.reputationScore || 538,
          reliabilityScore: stats?.reliabilityScore || 100,
          completionRate: stats?.completionRate || 100,
        };
      } catch {
        return {
          totalContributions: 0,
          totalPayouts: 0,
          totalSaved: 0,
          totalEarned: 0,
          savingStreak: 0,
          activePoolsCount: 0,
          referralCount: 0,
          accountTier: "SILVER",
          reputationScore: 538,
          reliabilityScore: 100,
          completionRate: 100,
        };
      }
    },
  };
}
