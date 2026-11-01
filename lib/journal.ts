import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isVideoUrl } from "./markdown";

export type Entry = {
  slug: string;
  title: string;
  date: string; // ISO
  minutes: number;
  phase: string;
  cover?: string;
  recordings: string[];
  body: string;
  images: number;
};

export const CONTENT_DIR = path.join(process.cwd(), "content/journal");
export const SLUG_RE = /^[a-z0-9-]+$/;

function read(file: string): Entry {
  const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? "Untitled"),
    date: new Date(data.date).toISOString(),
    minutes: Number(data.minutes) || 0,
    phase: String(data.phase ?? "research"),
    cover: data.cover || undefined,
    recordings: data.recordings ?? [],
    body: content.trim(),
    images: [...content.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].filter((m) => !isVideoUrl(m[1])).length,
  };
}

/** All entries, oldest first. */
export function getEntries(): Entry[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getEntry(slug: string) {
  if (!SLUG_RE.test(slug) || !fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`))) return null;
  return read(`${slug}.md`);
}

// Long titles are cut at the last whole word before 80 characters, so slugs never end mid-word.
export const slugify = (s: string) => {
  const slug = s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  if (slug.length <= 80) return slug.replace(/-$/, "");
  const cut = slug.slice(0, 81);
  return cut.slice(0, cut.lastIndexOf("-") > 0 ? cut.lastIndexOf("-") : 80).replace(/-$/, "");
};
