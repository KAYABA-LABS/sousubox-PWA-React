import { create } from "zustand";

export interface MobileMoneyAccount {
  id: string;
  network: "mtn" | "vodafone" | "airteltigo";
  last4: string;
  status: boolean;
}

interface MobileMoneyState {
  accounts: MobileMoneyAccount[];
  setPrimary: (id: string) => void;
  removeAccount: (id: string) => void;
  addAccount: (data: { network: MobileMoneyAccount["network"]; last4: string }) => void;
}

export const useMobileMoneyStore = create<MobileMoneyState>((set) => ({
  accounts: [
    { id: "1", network: "mtn", last4: "4567", status: true },
    { id: "2", network: "vodafone", last4: "8899", status: false },
  ],
  setPrimary: (id) =>
    set((state) => ({
      accounts: state.accounts.map((acc) => ({
        ...acc,
        status: acc.id === id,
      })),
    })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
    })),
  addAccount: (data) =>
    set((state) => ({
      accounts: [
        ...state.accounts,
        { id: Date.now().toString(), network: data.network, last4: data.last4, status: false },
      ],
    })),
}));
