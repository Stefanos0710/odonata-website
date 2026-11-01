"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDrafts, removeDraft, type Draft } from "@/lib/drafts";

const when = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Unpublished drafts kept in this browser. Rendered after mount because localStorage isn't available on the server.
export function DraftList() {
  const [drafts, setDrafts] = useState<{ key: string; draft: Draft }[]>([]);
  useEffect(() => setDrafts(listDrafts()), []);
  if (!drafts.length) return null;

  return (
    <section className="draft-list" aria-labelledby="drafts-title">
      <h2 id="drafts-title">Unpublished drafts</h2>
      <p>Saved automatically in this browser. They are not on the website until you publish them.</p>
      <ul>
        {drafts.map(({ key, draft }) => (
          <li key={key}>
            <Link href={key === "new" ? "/admin/new" : `/admin/edit/${key.slice(5)}`}>
              <span className="entry-title">{draft.title || "Untitled draft"}</span>
              <span className="entry-meta">
                {key === "new" ? "New entry" : "Changes to a published entry"}, saved {when(draft.savedAt)}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Discard the draft “${draft.title || "Untitled draft"}”?`)) return;
                removeDraft(key);
                setDrafts(listDrafts());
              }}
            >
              Discard
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
