"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePoolService } from "@/services/poolService";
import { useKycService } from "@/services/kycService";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  api,
  type DiscoverPool,
  type KycStatus,
  type UserCheckingAccount,
  type UserProfile,
  type UserRecentContribution,
} from "@/lib/api";
import { isDevMode } from "@/lib/dev";

export interface HomeData {
  isLoading: boolean;
  profile: UserProfile | null;
  account: UserCheckingAccount | null;
  kycStatus: KycStatus["status"];
  recent: UserRecentContribution[];
  popularPools: DiscoverPool[];
}

/** Loads everything the Home screen shows; each source fails independently. */
export function useHomeData(): HomeData {
  const { userId, isLoaded } = useAuth();
  const { dbUserId } = useCurrentUser();
  const poolService = usePoolService();
  const kycService = useKycService();
  const [data, setData] = useState<HomeData>({
    isLoading: true,
    profile: null,
    account: null,
    kycStatus: "NOT_SUBMITTED",
    recent: [],
    popularPools: [],
  });

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    let cancelled = false;

    /** Fetch all Home sources in parallel and merge whatever succeeds. */
    const load = async () => {
      const [profile, account, kyc, recent, discover] = await Promise.all([
        api.getUserProfile(dbUserId).catch(() => null),
        api.getUserCheckingAccount(dbUserId).catch(() => null),
        kycService.getStatus(dbUserId).catch(() => null),
        poolService.getRecentContributions(dbUserId, 5).catch(() => []),
        poolService.getDiscoverPools(dbUserId).catch(() => []),
      ]);
      if (cancelled) return;
      setData({
        isLoading: false,
        profile: profile?.data ?? null,
        account: account?.success ? account.checkingAccount : null,
        kycStatus: kyc?.status ?? "NOT_SUBMITTED",
        recent: (recent ?? []).slice(0, 4),
        popularPools: (discover ?? []).slice(0, 2),
      });
    };

    load();
    return () => {
      cancelled = true;
    };
    // Services are memoised; re-run only when identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId, dbUserId]);

  return data;
}
