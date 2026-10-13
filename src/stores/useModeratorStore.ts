import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ModeratorStatusResponse } from "@/lib/api";

/** Pinging `/moderator/status` counts as moderator activity (spec §3.3). */
export const PING_FOCUS_INTERVAL_MS = 60 * 60 * 1000;

export type PingReason = "app-open" | "focus" | "moderator-area";

/**
 * Plan decision 21: the moderator area always pings; app open pings once per
 * session when the cached status is APPROVED or unknown; focus pings at most
 * hourly, for approved moderators only.
 */
export function shouldPing(
  reason: PingReason,
  state: { status: ModeratorStatusResponse["status"] | null; lastPingAt: number | null },
  now: number
) {
  if (reason === "moderator-area") return true;
  if (reason === "app-open") return state.lastPingAt === null && (state.status === null || state.status === "APPROVED");
  return state.status === "APPROVED" && (state.lastPingAt === null || now - state.lastPingAt >= PING_FOCUS_INTERVAL_MS);
}

interface ModeratorState {
  /** Backend user the cached status belongs to. */
  ownerId: string | null;
  /** Cached across visits so non-moderators aren't pinged on every app open. */
  status: ModeratorStatusResponse["status"] | null;
  details: ModeratorStatusResponse | null;
  /** In-memory only: one "session" is one app load. */
  lastPingAt: number | null;
  setStatus: (details: ModeratorStatusResponse) => void;
  markPinged: (at: number) => void;
  /** Drops cached state when a different user signs in. */
  claim: (ownerId: string) => void;
}

export const useModeratorStore = create<ModeratorState>()(
  persist(
    (set) => ({
      ownerId: null,
      status: null,
      details: null,
      lastPingAt: null,
      setStatus: (details) => set({ details, status: details.status }),
      markPinged: (lastPingAt) => set({ lastPingAt }),
      claim: (ownerId) =>
        set((state) => (state.ownerId === ownerId ? state : { ownerId, status: null, details: null, lastPingAt: null })),
    }),
    {
      name: "moderator-status",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ownerId: state.ownerId, status: state.status }),
    }
  )
);
