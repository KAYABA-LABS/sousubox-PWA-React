"use client";

import { api, type DiscoverPool, type UserPoolMembership } from "@/lib/api";

export function usePoolService() {
  return {
    getDiscoverPools: async (userId: string): Promise<DiscoverPool[]> => {
      const result = await api.discoverPools(userId);
      return result.data || [];
    },

    joinPool: async (userId: string, poolId: string): Promise<void> => {
      await api.joinPool(userId, poolId);
    },

    getUserPools: async (userId: string): Promise<UserPoolMembership[]> => {
      const result = await api.getUserPools(userId);
      return result.data || [];
    },
  };
}
