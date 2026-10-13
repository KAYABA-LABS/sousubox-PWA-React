"use client";

import { useCallback, useEffect, useState } from "react";
import { useGroupPoolService } from "@/services/groupPoolService";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { shouldPing, useModeratorStore, type PingReason } from "@/stores/useModeratorStore";

/** Returns `ping(reason)`, which calls `/moderator/status` when the throttle allows and caches the result. */
export function useModeratorPing() {
  const service = useGroupPoolService();
  const { userId, ready } = useDatabaseUserId();
  const claim = useModeratorStore((s) => s.claim);

  useEffect(() => {
    if (ready && userId) claim(userId);
  }, [ready, userId, claim]);

  const ping = useCallback(
    async (reason: PingReason) => {
      if (!ready) return null;
      const store = useModeratorStore.getState();
      const now = Date.now();
      if (!shouldPing(reason, store, now)) return null;
      store.markPinged(now);
      try {
        const details = await service.getModeratorStatus(userId);
        useModeratorStore.getState().setStatus(details);
        return details;
      } catch {
        return null;
      }
    },
    [ready, service, userId]
  );

  return { ping, ready };
}

/** Global activity ping: once on app open, then on refocus at most hourly (plan decision 21). */
export function ModeratorPing() {
  const { ping, ready } = useModeratorPing();

  useEffect(() => {
    if (!ready) return;
    ping("app-open");
    const onVisible = () => {
      if (document.visibilityState === "visible") ping("focus");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [ready, ping]);

  return null;
}

/**
 * Pings on entering the moderator area and exposes the result. `loaded` stays
 * false until this visit's status call finishes.
 */
export function useModeratorAreaStatus() {
  const { ping, ready } = useModeratorPing();
  const details = useModeratorStore((s) => s.details);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => ping("moderator-area").then(() => setLoaded(true)), [ping]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  return { details: loaded ? details : null, loaded, refresh };
}
