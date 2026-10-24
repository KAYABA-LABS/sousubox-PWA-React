"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ModeratorDocumentField } from "@/lib/api";
import {
  deleteDraft,
  isDraftStorageAvailable,
  loadDraft,
  removeDraftFile,
  saveDraftFile,
  saveDraftMotivation,
} from "@/lib/moderatorDraft";

const MOTIVATION_SAVE_DELAY_MS = 500;

/**
 * The moderator application's picked files and motivation, mirrored to the
 * on-device draft. State always works in memory even when storage doesn't.
 */
export function useModeratorDraft(userId: string, enabled: boolean) {
  const [files, setFiles] = useState<Partial<Record<ModeratorDocumentField, File>>>({});
  const [motivation, setMotivationState] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [persistent, setPersistent] = useState(false);
  const timer = useRef<number | null>(null);
  const pendingMotivation = useRef<string | null>(null);
  // Writes still in flight, so `clear()` can't be overtaken by a late save.
  const writes = useRef(new Set<Promise<void>>());

  const track = useCallback((write: Promise<void>) => {
    writes.current.add(write);
    void write.finally(() => writes.current.delete(write));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const [available, draft] = await Promise.all([isDraftStorageAvailable(), loadDraft(userId)]);
      if (cancelled) return;
      setPersistent(available);
      if (draft) {
        setFiles((current) => ({ ...draft.files, ...current }));
        setMotivationState((current) => current || draft.motivation);
        setRestored(Object.keys(draft.files).length > 0 || !!draft.motivation);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  const flushMotivation = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    if (pendingMotivation.current !== null && enabled) {
      track(saveDraftMotivation(userId, pendingMotivation.current));
      pendingMotivation.current = null;
    }
  }, [enabled, userId, track]);

  useEffect(() => flushMotivation, [flushMotivation]);

  const setMotivation = useCallback(
    (text: string) => {
      setMotivationState(text);
      pendingMotivation.current = text;
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flushMotivation, MOTIVATION_SAVE_DELAY_MS);
    },
    [flushMotivation]
  );

  const setFile = useCallback(
    (field: ModeratorDocumentField, file: File | null) => {
      setFiles((current) => {
        const next = { ...current };
        if (file) next[field] = file;
        else delete next[field];
        return next;
      });
      if (!enabled) return;
      track(file ? saveDraftFile(userId, field, file) : removeDraftFile(userId, field));
    },
    [enabled, userId, track]
  );

  const clear = useCallback(async () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    pendingMotivation.current = null;
    setFiles({});
    setMotivationState("");
    setRestored(false);
    if (!enabled) return;
    await Promise.all(writes.current);
    await deleteDraft(userId);
  }, [enabled, userId]);

  return { files, motivation, setFile, setMotivation, clear, loaded, restored, persistent };
}
