"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSavingsService } from "@/services/savingsService";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { SavingsGoal } from "@/lib/api";
import { isDevMode } from "@/lib/dev";

export interface PlansData {
  isLoading: boolean;
  error: boolean;
  goals: SavingsGoal[];
  totalSaved: number;
  activeCount: number;
  /** Plans with a contribution coming up, soonest first. */
  upcoming: SavingsGoal[];
}

/** Loads the user's savings instruments and derives the totals the screens show. */
export function usePlansData(enabled = true): PlansData {
  const { userId, isLoaded } = useAuth();
  const { dbUserId } = useCurrentUser();
  const savingsService = useSavingsService();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || !isLoaded || (!userId && !isDevMode())) return;
    let cancelled = false;
    savingsService
      .getSavingsGoals(dbUserId)
      .then((result) => !cancelled && setGoals(result ?? []))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isLoaded, userId, dbUserId]);

  return useMemo(() => {
    const live = goals.filter((g) => g.status !== "CANCELLED" && g.status !== "ARCHIVED");
    return {
      isLoading,
      error,
      goals: live,
      totalSaved: live.reduce((sum, g) => sum + Number(g.balance || 0), 0),
      activeCount: live.filter((g) => g.status === "ACTIVE").length,
      upcoming: live
        .filter((g) => g.status === "ACTIVE" && g.dueDays !== null)
        .sort((a, b) => (a.dueDays ?? 0) - (b.dueDays ?? 0))
        .slice(0, 3),
    };
  }, [goals, isLoading, error]);
}
