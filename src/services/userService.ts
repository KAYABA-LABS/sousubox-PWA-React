"use client";

import { api, type UserProfile } from "@/lib/api";

export function useUserService() {
  return {
    getUserProfile: async (userId: string): Promise<UserProfile> => {
      const result = await api.getUserProfile(userId);
      if (!result.success) throw new Error(result.error || "Failed to fetch profile");
      return result.data;
    },
  };
}
