import type { Metadata } from "next";
import Link from "next/link";
import { getEntries } from "@/lib/journal";
import { PHASES } from "@/lib/phases";
import { formatDate, formatDuration } from "@/lib/markdown";
import { SessionCalendar } from "../session-calendar";

export const metadata: Metadata = { title: "Build journal" };

export default function JournalIndex() {
  const entries = getEntries();
  const total = entries.reduce((s, e) => s + e.minutes, 0);
  const groups = PHASES.map((p) => ({ ...p, list: entries.filter((e) => e.phase === p.id) })).filter((g) => g.list.length);
  const longest = Math.max(...entries.map((e) => e.minutes), 1);
  let n = 0;

  return (
    <div className="journal-index">
      <header className="page-head">
        <h1>Build journal</h1>
        <p>
          {entries.length} sessions and {formatDuration(total)} of work, written down right after each session.
          Oldest first, so you can read it like a story.
        </p>
        <SessionCalendar entries={entries} />
        <nav className="phase-nav" aria-label="Jump to phase">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`}>{g.label}</a>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="phase-group">
          <div className="phase-group-head">
            <h2>{g.label}</h2>
            <p>
              {formatDuration(g.list.reduce((s, e) => s + e.minutes, 0))} across {g.list.length}{" "}
              {g.list.length === 1 ? "session" : "sessions"}
            </p>
          </div>
          <ol className="entry-list">
            {g.list.map((e) => (
              <li key={e.slug}>
                <Link href={`/journal/${e.slug}`}>
                  <span className="entry-no">{++n}</span>
                  <span className="entry-main">
                    <span className="entry-title">{e.title}</span>
                    <span className="entry-meta">
                      {formatDate(e.date)}, {formatDuration(e.minutes)}
                      {e.images > 0 && `, ${e.images} ${e.images === 1 ? "image" : "images"}`}
                    </span>
                    <span className="entry-bar" style={{ "--w": e.minutes / longest } as React.CSSProperties} />
                  </span>
                  {e.cover ? <img src={e.cover} alt={`Cover photo of session ${n}: ${e.title}`} loading="lazy" /> : <span className="entry-thumb-empty" />}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
