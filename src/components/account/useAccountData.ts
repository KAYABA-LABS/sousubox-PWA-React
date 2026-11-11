"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserService } from "@/services/userService";
import { useKycService } from "@/services/kycService";
import { useProfileService } from "@/services/profileService";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { FundingSource, KycStatus, UserProfile, UserReferral, UserStats } from "@/lib/api";
import { isDevMode } from "@/lib/dev";

export interface AccountData {
  isLoading: boolean;
  profile: UserProfile | null;
  kycStatus: KycStatus["status"];
  fundingSources: FundingSource[];
  stats: UserStats | null;
  referral: UserReferral | null;
}

/** Profile, KYC status, MoMo wallets, reputation stats and referral code for Profile and Settings. */
export function useAccountData(): AccountData {
  const { userId, isLoaded } = useAuth();
  const { dbUserId } = useCurrentUser();
  const userService = useUserService();
  const kycService = useKycService();
  const profileService = useProfileService();
  const [data, setData] = useState<AccountData>({
    isLoading: true,
    profile: null,
    kycStatus: "NOT_SUBMITTED",
    fundingSources: [],
    stats: null,
    referral: null,
  });

  useEffect(() => {
    if (!isLoaded || (!userId && !isDevMode())) return;
    let cancelled = false;
    Promise.all([
      userService.getUserProfile(dbUserId).catch(() => null),
      kycService.getStatus(dbUserId).catch(() => null),
      userService.getFundingSources(dbUserId).catch(() => []),
      profileService.getUserStats(dbUserId),
      profileService.getUserReferral(dbUserId),
    ]).then(([profile, kyc, sources, stats, referral]) => {
      if (cancelled) return;
      setData({
        isLoading: false,
        profile: profile ?? null,
        kycStatus: kyc?.status ?? "NOT_SUBMITTED",
        fundingSources: sources ?? [],
        stats,
        referral,
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId, dbUserId]);

  return data;
}

const NETWORK_NAMES: Record<string, string> = { MTN: "MTN MoMo", TELECEL: "Telecel Cash", AIRTELTIGO: "AirtelTigo Money" };

/** Display name for a mobile-money network id. */
export function networkName(id: string) {
  return NETWORK_NAMES[id] ?? id;
}

/** "•••• 4821" from a phone number, never showing more than the last four digits. */
export function maskTail(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : "—";
}
