"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { usePoolService } from "@/services/poolService";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { ActivePoolListItem, AvailablePoolDetails, DiscoverPool, JoinedPoolListItem } from "@/lib/api";
import { isDevMode } from "@/lib/dev";

export interface PoolDetailState {
  listItem: DiscoverPool;
  details: AvailablePoolDetails | null;
  isLoading: boolean;
  error: string | null;
}

/** Loads the three pool lists and owns the discover → details → join flow. */
export function usePoolsData() {
  const { userId, isLoaded } = useAuth();
  const { dbUserId } = useCurrentUser();
  const poolService = usePoolService();
  const ready = isLoaded && (!!userId || isDevMode());

  const [active, setActive] = useState<ActivePoolListItem[] | null>(null);
  const [joined, setJoined] = useState<JoinedPoolListItem[] | null>(null);
  const [discover, setDiscover] = useState<DiscoverPool[] | null>(null);
  const [detail, setDetail] = useState<PoolDetailState | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  /** Fetch the user's pools (active and waiting to start). */
  const loadMine = useCallback(async () => {
    const [a, j] = await Promise.all([
      poolService.getActivePools(dbUserId).catch(() => []),
      poolService.getJoinedPools(dbUserId).catch(() => []),
    ]);
    setActive(a ?? []);
    setJoined(j ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUserId]);

  /** Fetch pools that are open to join. */
  const loadDiscover = useCallback(async () => {
    setDiscover((await poolService.getDiscoverPools(dbUserId).catch(() => [])) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUserId]);

  useEffect(() => {
    if (!ready) return;
    loadMine();
    loadDiscover();
  }, [ready, loadMine, loadDiscover]);

  /** Open the details modal for a discoverable pool and load its terms. */
  const openDetail = useCallback(
    async (pool: DiscoverPool) => {
      setDetail({ listItem: pool, details: null, isLoading: true, error: null });
      try {
        const details = await poolService.getAvailablePoolDetails(dbUserId, pool.id);
        setDetail((prev) => (prev?.listItem.id === pool.id ? { ...prev, details, isLoading: false } : prev));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load pool details";
        setDetail((prev) => (prev?.listItem.id === pool.id ? { ...prev, error: message, isLoading: false } : prev));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbUserId]
  );

  /** Join a pool, then refresh both lists. Returns true on success. */
  const join = useCallback(
    async (poolId: string) => {
      setJoiningId(poolId);
      try {
        await poolService.joinPool(dbUserId, poolId);
        toast.success("Successfully joined pool");
        setDetail(null);
        await Promise.all([loadMine(), loadDiscover()]);
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to join pool");
        return false;
      } finally {
        setJoiningId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbUserId, loadMine, loadDiscover]
  );

  return {
    active,
    joined,
    discover,
    detail,
    joiningId,
    openDetail,
    closeDetail: () => setDetail(null),
    join,
  };
}
