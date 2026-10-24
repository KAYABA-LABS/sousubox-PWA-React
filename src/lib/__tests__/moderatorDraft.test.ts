import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAllModeratorDrafts,
  deleteDraft,
  DRAFT_TTL_MS,
  isDraftStorageAvailable,
  loadDraft,
  removeDraftFile,
  resetDraftDbForTests,
  saveDraftFile,
  saveDraftMotivation,
} from "@/lib/moderatorDraft";

const pdf = (name = "cert.pdf", body = "%PDF-1.4") => new File([body], name, { type: "application/pdf" });

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDraftDbForTests();
});

describe("moderator draft", () => {
  it("round-trips files and motivation", async () => {
    await saveDraftFile("user-1", "businessRegistration", pdf());
    await saveDraftMotivation("user-1", "I run a susu group");

    const draft = await loadDraft("user-1");
    expect(draft?.motivation).toBe("I run a susu group");
    const file = draft?.files.businessRegistration;
    expect(file?.name).toBe("cert.pdf");
    expect(file?.type).toBe("application/pdf");
    expect(await file?.text()).toBe("%PDF-1.4");
  });

  it("removes a single file and deletes a whole draft", async () => {
    await saveDraftFile("user-1", "businessRegistration", pdf());
    await saveDraftFile("user-1", "proofOfAddress", pdf("bill.pdf"));
    await removeDraftFile("user-1", "businessRegistration");
    expect(Object.keys((await loadDraft("user-1"))?.files ?? {})).toEqual(["proofOfAddress"]);

    await deleteDraft("user-1");
    expect(await loadDraft("user-1")).toBeNull();
  });

  it("keeps users apart and drops other users' drafts on load", async () => {
    await saveDraftFile("user-1", "businessRegistration", pdf());
    await saveDraftFile("user-2", "proofOfAddress", pdf("bill.pdf"));

    const draft = await loadDraft("user-2");
    expect(Object.keys(draft?.files ?? {})).toEqual(["proofOfAddress"]);
    expect(await loadDraft("user-1")).toBeNull();
  });

  it("expires drafts after 14 days", async () => {
    await saveDraftMotivation("user-1", "old");
    expect(await loadDraft("user-1", Date.now() + DRAFT_TTL_MS + 1000)).toBeNull();
    expect(await loadDraft("user-1")).toBeNull();
  });

  it("clears every draft on sign-out", async () => {
    await saveDraftMotivation("user-1", "hello");
    await clearAllModeratorDrafts();
    expect(await loadDraft("user-1")).toBeNull();
  });

  it("an empty motivation removes the record", async () => {
    await saveDraftMotivation("user-1", "hello");
    await saveDraftMotivation("user-1", "");
    expect(await loadDraft("user-1")).toBeNull();
  });

  it("fails soft when IndexedDB is unavailable", async () => {
    const original = globalThis.indexedDB;
    vi.stubGlobal("indexedDB", undefined);
    resetDraftDbForTests();
    try {
      expect(await isDraftStorageAvailable()).toBe(false);
      await saveDraftFile("user-1", "businessRegistration", pdf());
      expect(await loadDraft("user-1")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
      globalThis.indexedDB = original;
    }
  });
});
