import type { ModeratorDocumentField } from "@/lib/api";

/**
 * On-device draft of a moderator application (plan decision 7). Records are
 * keyed `${userId}:${part}` where part is a document field or "motivation".
 * Files are stored as ArrayBuffers because older iOS Safari can't store Blobs
 * in IndexedDB reliably. Every call fails soft: no IndexedDB means no draft.
 */

const DB_NAME = "sousubox";
const STORE = "moderatorDraft";
export const DRAFT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

interface FileRecord {
  kind: "file";
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
  savedAt: number;
}
interface MotivationRecord {
  kind: "motivation";
  text: string;
  savedAt: number;
}
type DraftRecord = FileRecord | MotivationRecord;

export interface ModeratorDraft {
  motivation: string;
  files: Partial<Record<ModeratorDocumentField, File>>;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

/** Test hook: forget the cached connection so a fresh fake database is used. */
export function resetDraftDbForTests() {
  dbPromise = null;
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req ? (req.result as T) : null);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

const keyFor = (userId: string, part: string) => `${userId}:${part}`;
const userRange = (userId: string) => IDBKeyRange.bound(`${userId}:`, `${userId}:￿`);

export async function isDraftStorageAvailable() {
  return (await openDb()) !== null;
}

export async function saveDraftFile(userId: string, field: ModeratorDocumentField, file: File) {
  let data: ArrayBuffer;
  try {
    data = await file.arrayBuffer();
  } catch {
    return;
  }
  const record: FileRecord = {
    kind: "file",
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    data,
    savedAt: Date.now(),
  };
  await withStore("readwrite", (store) => store.put(record, keyFor(userId, field)));
}

export async function removeDraftFile(userId: string, field: ModeratorDocumentField) {
  await withStore("readwrite", (store) => store.delete(keyFor(userId, field)));
}

export async function saveDraftMotivation(userId: string, text: string) {
  const key = keyFor(userId, "motivation");
  if (!text) {
    await withStore("readwrite", (store) => store.delete(key));
    return;
  }
  const record: MotivationRecord = { kind: "motivation", text, savedAt: Date.now() };
  await withStore("readwrite", (store) => store.put(record, key));
}

export async function deleteDraft(userId: string) {
  await withStore("readwrite", (store) => store.delete(userRange(userId)));
}

/** Clears every user's draft (sign-out). */
export async function clearAllModeratorDrafts() {
  await withStore("readwrite", (store) => store.clear());
}

async function readAll(): Promise<[IDBValidKey[], DraftRecord[]] | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const keysReq = store.getAllKeys();
      const valuesReq = store.getAll();
      tx.oncomplete = () => resolve([keysReq.result, valuesReq.result as DraftRecord[]]);
      tx.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Loads this user's draft. Drafts belonging to other users are removed, and an
 * expired draft is deleted and reported as empty.
 */
export async function loadDraft(userId: string, now = Date.now()): Promise<ModeratorDraft | null> {
  const entries = await readAll();
  if (!entries) return null;

  const [keys, values] = entries;
  const prefix = `${userId}:`;
  const mine: [string, DraftRecord][] = [];
  const others: IDBValidKey[] = [];
  keys.forEach((key, i) => {
    if (typeof key === "string" && key.startsWith(prefix)) mine.push([key.slice(prefix.length), values[i]]);
    else others.push(key);
  });

  if (others.length > 0) {
    await withStore("readwrite", (store) => {
      for (const key of others) store.delete(key);
    });
  }
  if (mine.length === 0) return null;

  const newest = Math.max(...mine.map(([, record]) => record.savedAt));
  if (now - newest > DRAFT_TTL_MS) {
    await deleteDraft(userId);
    return null;
  }

  const draft: ModeratorDraft = { motivation: "", files: {} };
  for (const [part, record] of mine) {
    if (record.kind === "motivation") draft.motivation = record.text;
    else
      draft.files[part as ModeratorDocumentField] = new File([record.data], record.name, {
        type: record.type,
        lastModified: record.lastModified,
      });
  }
  return draft;
}
