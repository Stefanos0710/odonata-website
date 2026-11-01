"use server";

import crypto from "node:crypto";
import matter from "gray-matter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  COOKIE, SESSION_DAYS, checkPassword, checkTotp, clientIp, configProblem, createSession, lockedFor,
  recordFailure, recordSuccess, requireAdmin, totpEnabled,
} from "@/lib/auth";
import { getEntry, SLUG_RE, slugify } from "@/lib/journal";
import { PHASES } from "@/lib/phases";
import { commit, storageMode, uploadBlob, type Change } from "@/lib/storage";

export async function login(_: string | null, form: FormData) {
  const problem = configProblem();
  if (problem) return problem;

  const ip = await clientIp();
  const locked = lockedFor(ip);
  if (locked) return `Too many wrong attempts. Try again in ${Math.ceil(locked / 60_000)} minutes.`;

  const passwordOk = checkPassword(String(form.get("password") ?? ""));
  const codeOk = checkTotp(String(form.get("code") ?? "").replace(/\s/g, ""));
  if (!passwordOk || !codeOk) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600)); // slows down guessing
    // Don't say which part was wrong.
    return totpEnabled ? "Wrong password or code." : "Wrong password.";
  }

  recordSuccess(ip);
  (await cookies()).set(COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin");
}

// Detect the type from the file's first bytes; the browser-supplied type can't be trusted.
function imageType(b: Buffer) {
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.subarray(0, 4).toString("latin1") === "GIF8") return "gif";
  return null;
}

export async function uploadImage(form: FormData) {
  await requireAdmin();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "");
  if (!(file instanceof File)) throw new Error("No file received.");
  if (!SLUG_RE.test(folder)) throw new Error("Invalid image folder.");
  if (file.size > 4 * 1024 * 1024) throw new Error(`${file.name} is larger than 4 MB.`);
  const data = Buffer.from(await file.arrayBuffer());
  const ext = imageType(data);
  if (!ext) throw new Error(`${file.name}: only JPG, PNG, WebP and GIF images can be uploaded.`);

  const name = `${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}.${ext}`;
  const repoPath = `public/journal/${folder}/${name}`;
  const { sha } = await uploadBlob(repoPath, data);
  return { url: `/journal/${folder}/${name}`, path: repoPath, sha };
}

export type EntryInput = {
  originalSlug?: string;
  title: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  phase: string;
  cover?: string;
  recordings: string[];
  body: string;
  uploads: { path: string; sha?: string }[];
};

export async function saveEntry(input: EntryInput) {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) throw new Error("Add a title.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Pick a date.");
  if (!Number.isFinite(input.minutes) || input.minutes < 0 || input.minutes > 24 * 60) throw new Error("Time worked must be between 0 and 24 hours.");
  if (!PHASES.some((p) => p.id === input.phase)) throw new Error("Pick a phase.");
  const recordings = input.recordings.map((r) => r.trim()).filter(Boolean);
  if (recordings.some((r) => !/^https?:\/\//.test(r))) throw new Error("Recording links must start with http:// or https://");

  let slug = input.originalSlug;
  const existing = slug ? getEntry(slug) : null;
  if (slug && !existing) throw new Error("This entry no longer exists.");
  if (!slug) {
    const base = `${input.date}-${slugify(title) || "entry"}`;
    slug = base;
    for (let n = 2; getEntry(slug); n++) slug = `${base}-${n}`;
  }

  // Keep the original time of day when only the date changed.
  const time = existing && existing.date.slice(0, 10) === input.date ? existing.date.slice(10) : "T18:00:00.000Z";
  const data: Record<string, unknown> = {
    title,
    date: new Date(input.date + time),
    minutes: Math.round(input.minutes),
    phase: input.phase,
  };
  if (input.cover) data.cover = input.cover;
  if (recordings.length) data.recordings = recordings;

  const changes: Change[] = [
    { path: `content/journal/${slug}.md`, content: matter.stringify(`\n${input.body.trim()}\n`, data) },
    ...input.uploads.filter((u) => u.sha).map((u) => ({ path: u.path, sha: u.sha! })),
  ];
  await commit(changes, `${existing ? "Update" : "Add"} journal entry: ${title}`);

  revalidatePath("/", "layout");
  return { slug, mode: storageMode };
}

export async function deleteEntry(slug: string) {
  await requireAdmin();
  if (!getEntry(slug)) throw new Error("This entry no longer exists.");
  // ponytail: the entry's images stay in public/journal; delete the folder by hand if you need the space.
  await commit([{ path: `content/journal/${slug}.md`, delete: true }], `Delete journal entry ${slug}`);
  revalidatePath("/", "layout");
  return { mode: storageMode };
}
