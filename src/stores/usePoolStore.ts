import { create } from "zustand";
import type { DiscoverPool, UserPoolMembership } from "@/lib/api";

interface PoolState {
  discoverPools: DiscoverPool[];
  userPools: UserPoolMembership[];
  isLoading: boolean;
  setDiscoverPools: (pools: DiscoverPool[]) => void;
  setUserPools: (pools: UserPoolMembership[]) => void;
  setLoading: (loading: boolean) => void;
  removeDiscoverPool: (poolId: string) => void;
}

export const usePoolStore = create<PoolState>((set) => ({
  discoverPools: [],
  userPools: [],
  isLoading: false,
  setDiscoverPools: (discoverPools) => set({ discoverPools }),
  setUserPools: (userPools) => set({ userPools }),
  setLoading: (isLoading) => set({ isLoading }),
  removeDiscoverPool: (poolId) =>
    set((state) => ({
      discoverPools: state.discoverPools.filter((p) => p.id !== poolId),
    })),
}));
