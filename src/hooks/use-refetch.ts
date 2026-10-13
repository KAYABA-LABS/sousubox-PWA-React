"use client";

import { useEffect, useRef } from "react";

/** Calls `reload` when the tab becomes visible again or the window regains focus. */
export function useRefetchOnFocus(reload: () => void, enabled = true) {
  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  });

  useEffect(() => {
    if (!enabled) return;
    let last = 0;
    const handler = () => {
      if (document.visibilityState !== "visible") return;
      // focus and visibilitychange often fire together
      if (Date.now() - last < 1000) return;
      last = Date.now();
      reloadRef.current();
    };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("focus", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("focus", handler);
    };
  }, [enabled]);
}

/** Calls `poll` every `intervalMs` while `enabled` and the page is visible. */
export function useVisiblePolling(poll: () => void, enabled: boolean, intervalMs = 30_000) {
  const pollRef = useRef(poll);
  useEffect(() => {
    pollRef.current = poll;
  });

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") pollRef.current();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
