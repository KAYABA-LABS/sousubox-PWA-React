import { create } from "zustand";
import type { SavingsGoal } from "@/lib/api";

interface SavingsState {
  goals: SavingsGoal[];
  isLoading: boolean;
  setGoals: (goals: SavingsGoal[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSavingsStore = create<SavingsState>((set) => ({
  goals: [],
  isLoading: false,
  setGoals: (goals) => set({ goals }),
  setLoading: (isLoading) => set({ isLoading }),
}));
