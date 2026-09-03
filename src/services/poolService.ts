"use client";

import {
  api,
  ApiError,
  type DiscoverPool,
  type UserPoolMembership,
  type ActivePoolListItem,
  type ActivePoolDetails,
  type JoinedPoolListItem,
  type JoinedPoolDetails,
  type AvailablePoolDetails,
} from "@/lib/api";

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

    getActivePools: async (userId: string): Promise<ActivePoolListItem[]> => {
      const result = await api.getActivePools(userId);
      return result.data || [];
    },

    getActivePoolDetails: async (userId: string, poolId: string): Promise<ActivePoolDetails> => {
      const result = await api.getActivePoolDetails(userId, poolId);
      if (!result.success || !result.data) {
        throw new ApiError(result.message || result.error || "Failed to load pool", result.error);
      }
      return result.data;
    },

    getJoinedPools: async (userId: string): Promise<JoinedPoolListItem[]> => {
      const result = await api.getJoinedPools(userId);
      return result.data || [];
    },

    getJoinedPoolDetails: async (userId: string, poolId: string): Promise<JoinedPoolDetails> => {
      const result = await api.getJoinedPoolDetails(userId, poolId);
      if (!result.success || !result.data) {
        throw new ApiError(result.message || result.error || "Failed to load pool", result.error);
      }
      return result.data;
    },

    getAvailablePoolDetails: async (userId: string, poolId: string): Promise<AvailablePoolDetails> => {
      const result = await api.getAvailablePoolDetails(userId, poolId);
      if (!result.success || !result.data) {
        throw new ApiError(result.message || result.error || "Failed to load pool", result.error);
      }
      return result.data;
    },
  };
}
