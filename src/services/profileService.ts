"use client";

import { useMemo } from "react";
import { api, type UserStats } from "@/lib/api";

export function useProfileService() {
  return useMemo(() => ({
    getUserStats: async (userId: string): Promise<UserStats | null> => {
      try {
        const result = await api.getUserStats(userId);
        return result.success && result.data ? result.data : null;
      } catch {
        return null;
      }
    },
  }), []);
}
