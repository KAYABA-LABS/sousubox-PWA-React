"use client";

import { useMemo } from "react";
import { api, type UserProfile, type FundingSource, type FundingSourceIdentifier } from "@/lib/api";

export function useUserService() {
  return useMemo(() => ({
    getUserProfile: async (userId: string): Promise<UserProfile> => {
      const result = await api.getUserProfile(userId);
      if (!result.success) throw new Error(result.error || "Failed to fetch profile");
      return result.data;
    },
    updateUserProfile: async (userId: string, data: Record<string, string>): Promise<UserProfile> => {
      const result = await api.updateProfile(userId, data);
      if (!result.success) throw new Error(result.error || "Failed to update profile");
      return result.data;
    },
    getFundingSources: async (userId: string): Promise<FundingSource[]> => {
      const result = await api.getFundingSources(userId);
      if (!result.success || !result.data) throw new Error(result.message || result.error || "Failed to fetch funding sources");
      return result.data;
    },
    addFundingSource: async (userId: string, fundingSource: FundingSourceIdentifier): Promise<FundingSource[]> => {
      const result = await api.addFundingSource(userId, fundingSource);
      if (!result.success || !result.data) throw new Error(result.message || result.error || "Failed to add funding source");
      return result.data;
    },
    setActiveFundingSource: async (userId: string, fundingSource: FundingSourceIdentifier): Promise<FundingSource[]> => {
      const result = await api.setActiveFundingSource(userId, fundingSource);
      if (!result.success || !result.data) throw new Error(result.message || result.error || "Failed to update active funding source");
      return result.data;
    },
    removeFundingSource: async (userId: string, fundingSource: FundingSourceIdentifier): Promise<FundingSource[]> => {
      const result = await api.removeFundingSource(userId, fundingSource);
      if (!result.success || !result.data) throw new Error(result.message || result.error || "Failed to remove funding source");
      return result.data;
    },
  }), []);
}
