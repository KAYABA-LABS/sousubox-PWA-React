import { create } from "zustand";

interface TokensState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useTokensStore = create<TokensState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
}));
