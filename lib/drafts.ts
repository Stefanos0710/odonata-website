// Browser-side drafts: everything typed in the editor is kept in this browser until the entry is published,
// so a refresh, a closed tab or a crash can't lose it. Photos added to a draft are kept in IndexedDB.

export type Draft = {
  folder: string;
  originalSlug?: string;
  title: string;
  date: string;
  hours: string;
  mins: string;
  phase: string;
  cover: string;
  recordings: string;
  body: string;
  uploads: { path: string; sha?: string }[];
  savedAt: number;
};

const PREFIX = "odonata-draft:";

export const draftKey = (slug?: string) => (slug ? `edit:${slug}` : "new");

export function loadDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

/** Returns false when the browser refused to store it (private mode, storage full). */
export function saveDraft(key: string, draft: Draft): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function removeDraft(key: string) {
  try {
    const draft = loadDraft(key);
    localStorage.removeItem(PREFIX + key);
    if (draft) void clearMedia(draft.folder);
  } catch {
    /* nothing to remove */
  }
}

export function listDrafts(): { key: string; draft: Draft }[] {
  const out: { key: string; draft: Draft }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      const draft = loadDraft(k.slice(PREFIX.length));
      if (draft) out.push({ key: k.slice(PREFIX.length), draft });
    }
  } catch {
    /* storage blocked */
  }
  return out.sort((a, b) => b.draft.savedAt - a.draft.savedAt);
}

/* ---------- photo previews (IndexedDB) ---------- */

const mediaPrefix = (folder: string) => `/journal/${folder}/`;

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("odonata-drafts", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("media");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const done = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });

export async function putMedia(url: string, blob: Blob) {
  try {
    const tx = (await db()).transaction("media", "readwrite");
    tx.objectStore("media").put(blob, url);
    await done(tx);
  } catch {
    /* previews are a convenience; the draft text is saved regardless */
  }
}

export async function getMedia(url: string): Promise<Blob | undefined> {
  try {
    const store = (await db()).transaction("media").objectStore("media");
    return await new Promise((resolve, reject) => {
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function clearMedia(folder: string) {
  try {
    const tx = (await db()).transaction("media", "readwrite");
    const p = mediaPrefix(folder);
    tx.objectStore("media").delete(IDBKeyRange.bound(p, p + "￿"));
    await done(tx);
  } catch {
    /* ignore */
  }
}
