"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PHASES } from "@/lib/phases";
import { renderMarkdown } from "@/lib/markdown";
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

const imagesIn = (md: string) => [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);

export function EntryForm({ folder, initial }: { folder: string; initial: Initial }) {
  const router = useRouter();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<{ kind: "error" | "ok"; text: string; href?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const edit = <T,>(set: (v: T) => void) => (v: T) => { set(v); setDirty(true); };

  // Uploaded files aren't on the live site until the next deploy, so preview them from memory.
  const src = (url: string) => localPreviews[url] ?? url;
  const photos = useMemo(() => imagesIn(body), [body]);
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

  async function addFiles(files: Iterable<File>) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setStatus(null);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const small = await shrink(file);
        const form = new FormData();
        form.set("file", small);
        form.set("folder", folder);
        const res = await uploadImage(form);
        setUploads((u) => [...u, { path: res.path, sha: res.sha }]);
        setLocalPreviews((p) => ({ ...p, [res.url]: URL.createObjectURL(small) }));
        setCover((c) => c || res.url);
        insert(`![${file.name.replace(/\.\w+$/, "").replace(/[-_]/g, " ")}](${res.url})`);
      } catch (err) {
        setStatus({ kind: "error", text: err instanceof Error ? err.message : `Upload of ${file.name} failed.` });
      } finally {
        setUploading((n) => n - 1);
      }
    }
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
      setDirty(false);
      setUploads([]);
      if (res.mode === "local") {
        window.location.href = `/journal/${res.slug}`; // full load: the new page didn't exist when this one loaded
      } else {
        setStatus({ kind: "ok", text: "Published. The live page updates in about a minute.", href: `/journal/${res.slug}` });
        if (!initial.originalSlug) router.replace(`/admin/edit/${res.slug}`);
      }
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Saving failed." });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial.originalSlug || !confirm(`Delete “${title}”? This removes the entry from the journal.`)) return;
    try {
      await deleteEntry(initial.originalSlug);
      setDirty(false);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Deleting failed." });
    }
  }

  return (
    <form className="entry-form" onSubmit={save}>
      <div className="form-top">
        <Link href="/admin">All entries</Link>
        <h1>{initial.originalSlug ? "Edit entry" : "New entry"}</h1>
      </div>

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
          <button type="button" className="add-photos" onClick={() => fileInput.current?.click()} disabled={uploading > 0}>
            {uploading ? `Uploading ${uploading}…` : "Add photos"}
          </button>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files ?? []); e.target.value = ""; }} />
        </div>
        {tab === "write" ? (
          <textarea
            ref={textarea}
            value={body}
            onChange={(e) => edit(setBody)(e.target.value)}
            onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } }}
            onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); } }}
            rows={22}
            placeholder={"Write what you did, what went wrong and what you learned.\n\nMarkdown works: ## heading, **bold**, - list.\nDrop, paste or add photos and they appear where the cursor is."}
            aria-label="Entry text"
          />
        ) : (
          <div className="prose preview" dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Nothing written yet.</p>" }} />
        )}
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
        <button className="button" disabled={saving || uploading > 0}>
          {saving ? "Publishing…" : initial.originalSlug ? "Save changes" : "Publish entry"}
        </button>
        {initial.originalSlug && (
          <button type="button" className="button danger" onClick={remove}>Delete entry</button>
        )}
      </div>
    </form>
  );
}
