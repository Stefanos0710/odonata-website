// One-off import of the Fallout journal export into content/journal + public/journal.
// Usage: node scripts/import-fallout.mjs path/to/odonata-journal.md
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const FALLOUT = "https://fallout.hackclub.com";
const exportFile = process.argv[2];
if (!exportFile) throw new Error("Pass the path to the Fallout journal export (.md)");

// Fallout's export has no time per entry, but its project page (Inertia JSON) does.
async function fetchMinutes() {
  const html = await (await fetch(`${FALLOUT}/bulletin_board`)).text();
  const page = JSON.parse(html.match(/<script[^>]*data-page="app"[^>]*>(.*?)<\/script>/s)[1]);
  const res = await fetch(`${FALLOUT}/projects/130`, {
    headers: { "X-Inertia": "true", "X-Inertia-Version": page.version, "X-Requested-With": "XMLHttpRequest" },
  });
  const { props } = await res.json();
  return new Map(props.journal_entries.map((e) => [String(e.id), Math.round(e.time_logged / 60)]));
}

// Phases by entry position (1-based), from reading the journal.
const PHASES = [
  [2, "research"], [3, "design"], [14, "cad"], [26, "pcb"], [27, "landing"], [31, "firmware"], [99, "docs"],
];
const phaseOf = (n) => PHASES.find(([last]) => n <= last)[1];

const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/-$/, "");

const stripDate = (t) =>
  t.replace(/^(\d{1,2}(-\d{1,2})?\.?\s*(january|february|march|april|may|june)|(april|may)\s+\d+(st|nd|rd|th)?|\d{1,2}\.)\s*:?\s*/i, "").trim();

async function saveImage(url, file) {
  if (await fs.stat(file).catch(() => null)) return true; // re-runs only fetch what's missing
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url).catch((e) => ({ ok: false, status: e.message }));
    if (res.status === 404) return false; // deleted on Fallout itself
    if (!res.ok) console.warn(`retry ${url}: ${res.status}`);
    if (!res.ok) await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const out = sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 });
      await out.toFile(file);
      return true;
    }
  }
  throw new Error(`Failed to download ${url}`);
}

const minutes = await fetchMinutes();
const raw = (await fs.readFile(exportFile, "utf8")).replace(/\r\n/g, "\n");
const chunks = raw.split(/^## Entry \d+\n/m).slice(1);

await fs.rm("content/journal", { recursive: true, force: true });
await fs.mkdir("content/journal", { recursive: true });

const jobs = [];
let n = 0;
for (const chunk of chunks) {
  n++;
  const id = chunk.match(/^- ID: (\d+)/m)[1];
  const createdAt = chunk.match(/^- Created At: (\S+)/m)[1];
  const [contentPart, recPart = ""] = chunk.split(/^### Recording Links\n/m);
  let body = contentPart.split(/^### Content\n/m)[1].trim();

  const heading = body.match(/^#{1,6}\s+(.+)$/m);
  const title = stripDate(heading[1].trim());
  body = body.slice(body.indexOf(heading[0]) + heading[0].length).trim();
  body = body.replace(/^# /gm, "## "); // the page title is the only h1

  const dir = `public/journal/${id}`;
  await fs.mkdir(dir, { recursive: true });
  let i = 0;
  let cover = null;
  body = body.replace(/!\[[^\]]*\]\((\/user-attachments\/[^)\s]+)\)/g, (_, src) => {
    const name = `${String(++i).padStart(2, "0")}.webp`;
    const local = `/journal/${id}/${name}`;
    cover ??= local;
    const ref = `![Figure ${i}](${local})`;
    jobs.push({ run: () => saveImage(FALLOUT + src, `${dir}/${name}`), ref, mdFile: () => mdFile });
    return ref;
  });

  const recordings = [...recPart.matchAll(/^- (https?:\/\/\S+)/gm)].map((m) => m[1]);
  const date = createdAt.slice(0, 10);
  const front = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${createdAt}`,
    `minutes: ${minutes.get(id) ?? 0}`,
    `phase: ${phaseOf(n)}`,
    cover ? `cover: ${cover}` : null,
    `falloutId: ${id}`,
    recordings.length ? `recordings:\n${recordings.map((r) => `  - ${r}`).join("\n")}` : null,
    "---",
  ].filter(Boolean).join("\n");
  const mdFile = `content/journal/${date}-${slugify(title)}.md`;
  await fs.writeFile(mdFile, `${front}\n\n${body}\n`);
}

// Download with a small worker pool.
let done = 0;
const missing = [];
const queue = [...jobs];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    if (!(await job.run())) missing.push(job);
    if (++done % 50 === 0) console.log(`${done}/${jobs.length} images`);
  }
}));

// Drop references to images that no longer exist on Fallout.
for (const job of missing) {
  const file = job.mdFile();
  const md = await fs.readFile(file, "utf8");
  await fs.writeFile(file, md.replace(job.ref, ""));
}
console.log(`Imported ${chunks.length} entries, ${jobs.length - missing.length} images (${missing.length} missing on Fallout).`);
