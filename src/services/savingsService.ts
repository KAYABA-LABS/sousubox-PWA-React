"use client";

import { api, type SavingsGoal } from "@/lib/api";

export function useSavingsService() {
  return {
    getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
      const result = await api.getSavingsInstruments(userId);
      const raw = result.data || [];
      const now = Date.now();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return raw.map((item: any): SavingsGoal => {
        const dueMs = item.nextContributionDue
          ? new Date(item.nextContributionDue).getTime() - now
          : null;
        const dueDays = dueMs !== null ? Math.ceil(dueMs / 86_400_000) : null;

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          status: item.status,
          balance: item.currentBalance ?? 0,
          target: item.targetAmount ?? 0,
          dueDays,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });
    },

    getInstrumentById: async (userId: string, instrumentId: string) => {
      const result = await api.getSavingsInstrumentById(userId, instrumentId);
      return result.data;
    },

    getAutoSave: async (userId: string) => {
      const result = await api.getAutoSaveInstrument(userId);
      return result.data;
    },

    getTimeLock: async (userId: string) => {
      const result = await api.getTimeLockInstrument(userId);
      return result.data;
    },

    getFlexibleSavings: async (userId: string) => {
      const result = await api.getFlexibleSavingsInstrument(userId);
      return result.data;
    },

    getTargetFund: async (userId: string) => {
      const result = await api.getTargetFundInstrument(userId);
      return result.data;
    },

    activateAutoSave: async (userId: string, instrumentId: string, data: Record<string, unknown>) => {
      return api.activateAutoSave(userId, instrumentId, data);
    },

    activateTimeLock: async (userId: string, instrumentId: string, data: Record<string, unknown>) => {
      return api.activateTimeLock(userId, instrumentId, data);
    },

    activateFlexibleSavings: async (userId: string, instrumentId: string, data: Record<string, unknown>) => {
      return api.activateFlexibleSavings(userId, instrumentId, data);
    },

    activateTargetFund: async (userId: string, instrumentId: string, data: Record<string, unknown>) => {
      return api.activateTargetFund(userId, instrumentId, data);
    },
  };
}
