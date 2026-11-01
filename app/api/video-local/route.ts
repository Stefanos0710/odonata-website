import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { isAdmin } from "@/lib/auth";
import { SLUG_RE } from "@/lib/journal";
import { storageMode } from "@/lib/storage";

const TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/x-m4v": "m4v" };

// Local development only: stream the video to public/journal/<folder>/ on this computer.
export async function PUT(request: Request) {
  if (storageMode !== "local" || process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  if (!(await isAdmin())) return Response.json({ error: "You are signed out. Sign in again to upload." }, { status: 401 });

  const folder = new URL(request.url).searchParams.get("folder") ?? "";
  const ext = TYPES[request.headers.get("content-type") ?? ""];
  if (!SLUG_RE.test(folder)) return Response.json({ error: "Invalid folder." }, { status: 400 });
  if (!ext) return Response.json({ error: "Only MP4, WebM and MOV videos can be uploaded." }, { status: 400 });
  if (!request.body) return Response.json({ error: "No file received." }, { status: 400 });

  const name = `${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}.${ext}`;
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public/journal", folder);
  await fs.promises.mkdir(dir, { recursive: true });
  await pipeline(Readable.fromWeb(request.body as never), fs.createWriteStream(path.join(dir, name)));
  return Response.json({ url: `/journal/${folder}/${name}` });
}
