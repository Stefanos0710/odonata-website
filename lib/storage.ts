import fs from "node:fs/promises";
import path from "node:path";

// Two modes:
// - GITHUB_TOKEN set (production): changes become one commit on GitHub, and Vercel redeploys the site.
// - otherwise (local dev): files are written straight into this folder; commit and push them yourself.
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO ?? "Stefanos0710/Odonata-Website";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

export const storageMode = TOKEN ? "github" : "local";

export type Change =
  | { path: string; content: string } // text file
  | { path: string; sha: string } // blob already uploaded with uploadBlob
  | { path: string; delete: true };

async function gh<T>(endpoint: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${REPO}${endpoint}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub ${init?.method ?? "GET"} ${endpoint} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Stores a binary file. On GitHub this only creates the blob; it lands in the repo with the next commit(). */
export async function uploadBlob(repoPath: string, data: Buffer): Promise<{ sha?: string }> {
  if (storageMode === "github") {
    const { sha } = await gh<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: { content: data.toString("base64"), encoding: "base64" },
    });
    return { sha };
  }
  const file = path.join(/*turbopackIgnore: true*/ process.cwd(), repoPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
  return {};
}

export async function commit(changes: Change[], message: string) {
  if (storageMode === "local") {
    for (const c of changes) {
      const file = path.join(/*turbopackIgnore: true*/ process.cwd(), c.path);
      if ("delete" in c) await fs.rm(file, { force: true });
      else if ("content" in c) {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, c.content);
      } // "sha" changes were already written by uploadBlob
    }
    return;
  }

  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${BRANCH}`);
  const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
  const tree = await gh<{ sha: string }>("/git/trees", {
    method: "POST",
    body: {
      base_tree: parent.tree.sha,
      tree: changes.map((c) => ({
        path: c.path,
        mode: "100644",
        type: "blob",
        ...("delete" in c ? { sha: null } : "sha" in c ? { sha: c.sha } : { content: c.content }),
      })),
    },
  });
  const created = await gh<{ sha: string }>("/git/commits", {
    method: "POST",
    body: { message, tree: tree.sha, parents: [ref.object.sha] },
  });
  await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: { sha: created.sha } });
}
