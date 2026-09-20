"use client";

import { useMemo } from "react";
import { api, type KycStatus, type KycSession } from "@/lib/api";

export function useKycService() {
  return useMemo(() => ({
    getStatus: async (userId: string): Promise<KycStatus> => {
      const result = await api.getKycStatus(userId);
      return result.data || { status: "NOT_SUBMITTED" };
    },

    createSession: async (
      userId: string,
      options?: {
        callback?: string;
        callback_method?: "initiator" | "completer" | "both";
        metadata?: Record<string, unknown>;
        language?: string;
      }
    ): Promise<KycSession> => {
      const result = await api.createKycSession(userId, options);
      return result.data;
    },
  }), []);
}
