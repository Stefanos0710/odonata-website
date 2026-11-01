"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PHASES } from "@/lib/phases";
import { isVideoUrl, renderMarkdown } from "@/lib/markdown";
import { draftKey, getMedia, loadDraft, putMedia, removeDraft, saveDraft, type Draft } from "@/lib/drafts";
import type { VideoMode } from "@/lib/video-mode";
import { deleteEntry, saveEntry, uploadImage } from "./actions";

type Initial = {
  originalSlug?: string;
  title?: string;
  date: string;
  minutes?: number;
  phase?: string;
  cover?: string;
  recordings?: string[];
  body?: string;
};

const MAX_VIDEO_MB = 500;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

// Photos from phones are often 5–10 MB; shrink them in the browser so uploads stay small and fast.
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  let blob = await toBlob("image/webp", 0.82);
  if (blob?.type !== "image/webp") blob = await toBlob("image/jpeg", 0.85); // Safari can't encode WebP
  if (!blob) throw new Error(`Could not read ${file.name}.`);
  return new File([blob], file.name.replace(/\.\w+$/, "") + (blob.type === "image/webp" ? ".webp" : ".jpg"), { type: blob.type });
}

// Local dev: XHR instead of fetch so the upload can report progress.
function putWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        xhr.status < 300 ? resolve(res.url) : reject(new Error(res.error ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(file);
  });
}

const mediaIn = (md: string) => [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
const time = (ms: number) => new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function EntryForm({ folder: initialFolder, initial, videoMode }: { folder: string; initial: Initial; videoMode: VideoMode }) {
  const router = useRouter();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const key = draftKey(initial.originalSlug);

  const [folder, setFolder] = useState(initialFolder);
  const [title, setTitle] = useState(initial.title ?? "");
  const [date, setDate] = useState(initial.date);
  const [hours, setHours] = useState(String(Math.floor((initial.minutes ?? 0) / 60)));
  const [mins, setMins] = useState(String((initial.minutes ?? 0) % 60));
  const [phase, setPhase] = useState(initial.phase ?? PHASES[PHASES.length - 1].id);
  const [cover, setCover] = useState(initial.cover ?? "");
  const [recordings, setRecordings] = useState((initial.recordings ?? []).join("\n"));
  const [body, setBody] = useState(initial.body ?? "");
  const [uploads, setUploads] = useState<{ path: string; sha?: string }[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(0);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<{ kind: "error" | "ok"; text: string; href?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false); // the draft check has finished
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [draftFailed, setDraftFailed] = useState(false);

  // Always holds the newest values, so the page-hide handler can save without stale data.
  const latest = useRef<Draft>(null as unknown as Draft);
  latest.current = { folder, originalSlug: initial.originalSlug, title, date, hours, mins, phase, cover, recordings, body, uploads, savedAt: 0 };
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  // On load: bring back an unpublished draft, if this browser has one.
  useEffect(() => {
    const d = loadDraft(key);
    if (d) {
      setFolder(d.folder);
      setTitle(d.title);
      setDate(d.date);
      setHours(d.hours);
      setMins(d.mins);
      setPhase(d.phase);
      setCover(d.cover);
      setRecordings(d.recordings);
      setBody(d.body);
      setUploads(d.uploads);
      setDirty(true);
      setRestoredAt(d.savedAt);
      for (const u of d.uploads) {
        const url = "/" + u.path.replace(/^public\//, "");
        getMedia(url).then((blob) => blob && setLocalPreviews((p) => ({ ...p, [url]: URL.createObjectURL(blob) })));
      }
    }
    setReady(true);
  }, [key]);

  function persist() {
    if (!dirtyRef.current) return;
    const ok = saveDraft(key, { ...latest.current, savedAt: Date.now() });
    setDraftFailed(!ok);
    if (ok) setDraftSavedAt(Date.now());
  }

  // Autosave shortly after every change, and immediately when the tab is hidden or closed.
  useEffect(() => {
    if (!ready || !dirty) return;
    const t = setTimeout(persist, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, dirty, folder, title, date, hours, mins, phase, cover, recordings, body, uploads]);

  useEffect(() => {
    const flush = () => document.visibilityState !== "visible" && persist();
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", persist);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", persist);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Ctrl/Cmd+S saves the draft right now instead of opening the browser's save dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        persist();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Warn before leaving only when there are changes that are not published yet.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const edit = <T,>(set: (v: T) => void) => (v: T) => { set(v); setDirty(true); };

  // Uploaded files aren't on the live site until the next deploy, so preview them from memory.
  const src = (url: string) => localPreviews[url] ?? url;
  const photos = useMemo(() => mediaIn(body).filter((u) => !isVideoUrl(u)), [body]);
  const videoCount = useMemo(() => mediaIn(body).filter(isVideoUrl).length, [body]);
  const previewHtml = useMemo(
    () => (tab === "preview" ? renderMarkdown(body).replace(/(src|href)="([^"]+)"/g, (m, attr, url) => `${attr}="${src(url)}"`) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, body, localPreviews],
  );

  function insert(text: string) {
    const el = textarea.current;
    setBody((current) => {
      const at = el?.selectionStart ?? current.length;
      const before = current.slice(0, at);
      const pad = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      return before + pad + text + "\n\n" + current.slice(at);
    });
    setDirty(true);
  }

  const fail = (err: unknown, fallback: string) => setStatus({ kind: "error", text: err instanceof Error ? err.message : fallback });
  const caption = (file: File) => file.name.replace(/\.\w+$/, "").replace(/[-_]/g, " ");

  async function addPhoto(file: File) {
    const small = await shrink(file);
    const form = new FormData();
    form.set("file", small);
    form.set("folder", folder);
    const res = await uploadImage(form);
    setUploads((u) => [...u, { path: res.path, sha: res.sha }]);
    setLocalPreviews((p) => ({ ...p, [res.url]: URL.createObjectURL(small) }));
    void putMedia(res.url, small);
    setCover((c) => c || res.url);
    insert(`![${caption(file)}](${res.url})`);
  }

  async function addVideo(file: File) {
    if (videoMode === "none") throw new Error("Video upload isn't set up on this site yet. Embed a link instead, or connect Vercel Blob storage (see the README).");
    if (!VIDEO_TYPES.includes(file.type)) throw new Error(`${file.name}: use an MP4, WebM or MOV video.`);
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_VIDEO_MB} MB. Trim or compress it, or upload it to YouTube and embed the link.`);
    setVideoProgress(0);
    try {
      let url: string;
      if (videoMode === "blob") {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(`journal/${folder}/${file.name.replace(/[^\w.-]+/g, "-")}`, file, {
          access: "public",
          handleUploadUrl: "/api/video-upload",
          multipart: true,
          onUploadProgress: ({ percentage }) => setVideoProgress(Math.round(percentage)),
        });
        url = blob.url;
      } else {
        url = await putWithProgress(`/api/video-local?folder=${encodeURIComponent(folder)}`, file, setVideoProgress);
      }
      insert(`![${caption(file)}](${url})`);
    } finally {
      setVideoProgress(null);
    }
  }

  async function addFiles(files: Iterable<File>) {
    const list = [...files].filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (!list.length) return;
    setStatus(null);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        await (file.type.startsWith("video/") ? addVideo(file) : addPhoto(file));
      } catch (err) {
        fail(err, `Upload of ${file.name} failed.`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function embedLink() {
    const url = window.prompt("Paste a video link: YouTube, Vimeo, or a direct link ending in .mp4 / .webm")?.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url) || !isVideoUrl(url)) {
      setStatus({ kind: "error", text: "That doesn't look like a video link. Use a YouTube or Vimeo link, or a direct link ending in .mp4, .webm or .mov." });
      return;
    }
    setStatus(null);
    insert(`![Video](${url})`);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const minutes = (Number(hours) || 0) * 60 + (Number(mins) || 0);
      const res = await saveEntry({
        originalSlug: initial.originalSlug,
        title, date, minutes, phase,
        cover: cover && photos.includes(cover) ? cover : photos[0],
        recordings: recordings.split("\n"),
        body,
        uploads,
      });
      removeDraft(key); // published: the draft is no longer needed
      setDirty(false);
      dirtyRef.current = false;
      setUploads([]);
      setRestoredAt(null);
      setDraftSavedAt(null);
      if (res.mode === "local") {
        // The dev server needs a moment to notice the new file; wait until the page exists, then do a full load.
        for (let i = 0; i < 8 && !(await fetch(`/journal/${res.slug}`, { cache: "no-store" })).ok; i++) await new Promise((r) => setTimeout(r, 400));
        window.location.href = `/journal/${res.slug}`;
      } else {
        setStatus({ kind: "ok", text: "Published. The live page updates in about a minute.", href: `/journal/${res.slug}` });
        if (!initial.originalSlug) router.replace(`/admin/edit/${res.slug}`);
      }
    } catch (err) {
      // Publishing failed: the draft is still stored in this browser, so nothing is lost.
      persist();
      fail(err, "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  function discardDraft() {
    if (!confirm("Discard this draft? The text and photos you added since the last publish will be removed from this browser.")) return;
    removeDraft(key);
    dirtyRef.current = false;
    setDirty(false);
    window.location.reload();
  }

  async function remove() {
    if (!initial.originalSlug || !confirm(`Delete “${title}”? This removes the entry from the journal.`)) return;
    try {
      await deleteEntry(initial.originalSlug);
      removeDraft(key);
      setDirty(false);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      fail(err, "Deleting failed.");
    }
  }

  const busy = uploading > 0;

  return (
    <form className="entry-form" onSubmit={save}>
      <div className="form-top">
        <Link href="/admin">All entries</Link>
        <h1>{initial.originalSlug ? "Edit entry" : "New entry"}</h1>
      </div>

      {restoredAt && (
        <p className="draft-banner" role="status">
          <span>We brought back your unpublished draft from {time(restoredAt)}.</span>
          <button type="button" onClick={discardDraft}>Discard draft</button>
        </p>
      )}

      <label className="field-title">
        Title
        <input value={title} onChange={(e) => edit(setTitle)(e.target.value)} required placeholder="What did you work on?" />
      </label>

      <div className="field-row">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => edit(setDate)(e.target.value)} required />
        </label>
        <fieldset className="duration">
          <legend>Time worked</legend>
          <div>
            <label>
              <input type="number" min={0} max={24} inputMode="numeric" value={hours} onChange={(e) => edit(setHours)(e.target.value)} />
              h
            </label>
            <label>
              <input type="number" min={0} max={59} step={5} inputMode="numeric" value={mins} onChange={(e) => edit(setMins)(e.target.value)} />
              min
            </label>
          </div>
        </fieldset>
        <label>
          Phase
          <select value={phase} onChange={(e) => edit(setPhase)(e.target.value)}>
            {PHASES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
      </div>

      <div className="editor">
        <div className="editor-bar" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")}>Write</button>
          <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>Preview</button>
          <span className="editor-tools">
            <button type="button" className="tool" onClick={() => photoInput.current?.click()} disabled={busy}>Add photos</button>
            <button
              type="button"
              className="tool"
              onClick={() => videoInput.current?.click()}
              disabled={busy || videoMode === "none"}
              title={videoMode === "none" ? "Video upload isn't set up yet. Use “Embed video link”." : `MP4, WebM or MOV, up to ${MAX_VIDEO_MB} MB`}
            >
              {videoProgress !== null ? `Uploading video ${videoProgress}%` : "Add video"}
            </button>
            <button type="button" className="tool" onClick={embedLink}>Embed video link</button>
          </span>
          <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files ?? []); e.target.value = ""; }} />
          <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" hidden onChange={(e) => { addFiles(e.target.files ?? []); e.target.value = ""; }} />
        </div>
        {tab === "write" ? (
          <textarea
            ref={textarea}
            value={body}
            onChange={(e) => edit(setBody)(e.target.value)}
            onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } }}
            onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); } }}
            rows={22}
            placeholder={"Write what you did, what went wrong and what you learned.\n\nMarkdown works: ## heading, **bold**, - list.\nDrop, paste or add photos and videos and they appear where the cursor is."}
            aria-label="Entry text"
          />
        ) : (
          <div className="prose preview" dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Nothing written yet.</p>" }} />
        )}
        <p className={`draft-status${draftFailed ? " failed" : ""}`} role="status" aria-live="polite">
          {draftFailed
            ? "Couldn't save a draft: this browser blocked storage. Copy your text somewhere safe before leaving."
            : draftSavedAt
              ? `Draft saved in this browser at ${time(draftSavedAt)}. Publish when you're ready.${videoCount ? ` ${videoCount} video${videoCount > 1 ? "s" : ""} in this entry.` : ""}`
              : dirty
                ? "Saving draft…"
                : "Everything you type is saved as a draft in this browser."}
        </p>
      </div>

      {photos.length > 0 && (
        <fieldset className="cover-picker">
          <legend>Cover photo (shown in the journal list)</legend>
          <div>
            {photos.map((url) => (
              <label key={url}>
                <input type="radio" name="cover" checked={(cover && photos.includes(cover) ? cover : photos[0]) === url} onChange={() => edit(setCover)(url)} />
                <img src={src(url)} alt="" />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label>
        Recording links (optional, one per line)
        <textarea rows={2} value={recordings} onChange={(e) => edit(setRecordings)(e.target.value)} placeholder="https://…/timelapse.mp4" />
      </label>

      {status && (
        <p className={status.kind === "error" ? "form-error" : "form-ok"} role={status.kind === "error" ? "alert" : "status"}>
          {status.text} {status.href && <Link href={status.href}>Open entry</Link>}
        </p>
      )}

      <div className="form-actions">
        <button className="button" disabled={saving || busy}>
          {saving ? "Publishing…" : initial.originalSlug ? "Save changes" : "Publish entry"}
        </button>
        {initial.originalSlug && (
          <button type="button" className="button danger" onClick={remove}>Delete entry</button>
        )}
      </div>
    </form>
  );
}
