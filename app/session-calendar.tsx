import Link from "next/link";
import type { Entry } from "@/lib/journal";
import { formatDuration } from "@/lib/markdown";
import { getCommits } from "@/lib/github";

// One square per day, darker = more hours; a lime dot = commits on GitHub, bigger = more. Days with a session link to its entry.
const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }); // YYYY-MM-DD
const STEPS = [60, 120, 180, 240]; // minutes: under 1 h, 1–2 h, 2–3 h, 3–4 h, 4 h+
const level = (m: number) => (m ? STEPS.filter((s) => m >= s).length + 1 : 0);
const COMMIT_STEPS = [3, 6, 10]; // commits: 1–2, 3–5, 6–9, 10+
const commitLevel = (n: number) => COMMIT_STEPS.filter((s) => n >= s).length + 1;

export async function SessionCalendar({ entries }: { entries: Entry[] }) {
  if (!entries.length) return null;
  const commitsByDay = new Map<string, number>();
  for (const r of await getCommits()) for (const d of r.dates) {
    const k = dayKey(new Date(d));
    commitsByDay.set(k, (commitsByDay.get(k) ?? 0) + 1);
  }
  const commitDays = [...commitsByDay.keys()].sort();
  const byDay = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = dayKey(new Date(e.date));
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }

  // From the Monday before the first session or commit to the Sunday after the last.
  const sessionDays = [dayKey(new Date(entries[0].date)), dayKey(new Date(entries[entries.length - 1].date))];
  const span = [...sessionDays, ...commitDays.slice(0, 1), ...commitDays.slice(-1)].sort();
  const first = new Date(span[0] + "T12:00:00Z");
  const last = new Date(span[span.length - 1] + "T12:00:00Z");
  first.setUTCDate(first.getUTCDate() - ((first.getUTCDay() + 6) % 7));
  last.setUTCDate(last.getUTCDate() + ((7 - last.getUTCDay()) % 7));
  const days: Date[] = [];
  for (const d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) days.push(new Date(d));

  const weeks = days.length / 7;
  const months = days
    .map((d, i) => ({ i, d }))
    .filter(({ d, i }) => i % 7 === 0 && (i === 0 || d.getUTCDate() <= 7))
    .map(({ d, i }) => ({ col: i / 7 + 1, label: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }) }));

  const cells = days.map((d, i) => {
    const list = byDay.get(dayKey(d)) ?? [];
    return {
      list,
      minutes: list.reduce((s, e) => s + e.minutes, 0),
      commits: commitsByDay.get(dayKey(d)) ?? 0,
      date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" }),
      col: Math.floor(i / 7) + 2,
      row: (i % 7) + 2,
      side: Math.floor(i / 7) + 1 > weeks / 2 ? "end" : undefined,
    };
  });
  const showCommits = commitDays.length > 0;

  return (
    <figure className="calendar">
      <div className="cal-grid" style={{ "--weeks": weeks } as React.CSSProperties}>
        {months.map((m) => (
          <span key={m.col} className="cal-month" style={{ gridColumn: m.col + 1 }}>{m.label}</span>
        ))}
        {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, r) => (
          <span key={r} className="cal-weekday" style={{ gridRow: r + 2 }}>{d}</span>
        ))}
        {cells.map((c, i) => {
          const style = { gridColumn: c.col, gridRow: c.row };
          const commits = c.commits ? commitLevel(c.commits) : undefined;
          if (!c.list.length && !c.commits) return <span key={i} className="cal-day" data-level={0} style={style} />;
          const tip = [
            c.date + ":",
            c.list.length && formatDuration(c.minutes) + (c.commits ? "," : ""),
            c.commits && `${c.commits} ${c.commits === 1 ? "commit" : "commits"}`,
            c.list.length && "— " + c.list.map((e) => e.title).join(" / "),
          ].filter(Boolean).join(" ");
          const props = { className: "cal-day", "data-level": level(c.minutes), "data-commits": commits, style, "aria-label": tip, "data-tip": tip, "data-side": c.side };
          return c.list.length
            ? <Link key={i} href={`/journal/${c.list[0].slug}`} {...props} />
            : <span key={i} tabIndex={0} {...props} />;
        })}
      </div>
      <figcaption className="cal-legend">
        <span className="cal-scale" aria-hidden="true">
          Time worked
          {[1, 2, 3, 4, 5].map((l) => <span key={l} className="cal-day" data-level={l} />)}
          4 h+
        </span>
        {showCommits && (
          <span className="cal-scale" aria-hidden="true">
            Commits
            {[1, 2, 3, 4].map((l) => <span key={l} className="cal-day" data-level={0} data-commits={l} />)}
            10+
          </span>
        )}
      </figcaption>
    </figure>
  );
}
