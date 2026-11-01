import Link from "next/link";
import type { Entry } from "@/lib/journal";
import { formatDuration } from "@/lib/markdown";
import { getCommits } from "@/lib/github";

// One square per day, darker = more hours, a dot = commits on GitHub. Days with a session link to its entry.
const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }); // YYYY-MM-DD
const STEPS = [60, 120, 180, 240]; // minutes: under 1 h, 1–2 h, 2–3 h, 3–4 h, 4 h+
const level = (m: number) => (m ? STEPS.filter((s) => m >= s).length + 1 : 0);

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

  return (
    <figure className="calendar">
      <div className="cal-grid" style={{ "--weeks": weeks } as React.CSSProperties}>
        {months.map((m) => (
          <span key={m.col} className="cal-month" style={{ gridColumn: m.col + 1 }}>{m.label}</span>
        ))}
        {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, r) => (
          <span key={r} className="cal-weekday" style={{ gridRow: r + 2 }}>{d}</span>
        ))}
        {days.map((d, i) => {
          const list = byDay.get(dayKey(d)) ?? [];
          const commits = commitsByDay.get(dayKey(d)) ?? 0;
          const commitNote = commits ? `${commits} ${commits === 1 ? "commit" : "commits"}` : "";
          const minutes = list.reduce((s, e) => s + e.minutes, 0);
          const date = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });
          const style = { gridColumn: Math.floor(i / 7) + 2, gridRow: (i % 7) + 2 };
          const side = Math.floor(i / 7) + 1 > weeks / 2 ? "end" : undefined;
          if (!list.length) {
            if (!commits) return <span key={i} className="cal-day" data-level={0} style={style} />;
            const tip = `${date}: ${commitNote}`;
            return <span key={i} className="cal-day" data-level={0} data-commits style={style} tabIndex={0} aria-label={tip} data-tip={tip} data-side={side} />;
          }
          const tip = `${date}: ${formatDuration(minutes)}${commits ? `, ${commitNote}` : ""}, ${list.map((e) => e.title).join(" / ")}`;
          return (
            <Link key={i} href={`/journal/${list[0].slug}`} className="cal-day" data-level={level(minutes)} data-commits={commits ? "" : undefined} style={style} aria-label={tip} data-tip={tip} data-side={side} />
          );
        })}
      </div>
      <figcaption className="cal-legend">
        <span>Time worked per day</span>
        <span className="cal-scale" aria-hidden="true">
          less
          {[1, 2, 3, 4, 5].map((l) => <span key={l} className="cal-day" data-level={l} />)}
          4 h+
        </span>
        {commitDays.length > 0 && (
          <span className="cal-scale" aria-hidden="true">
            <span className="cal-day" data-level={0} data-commits /> commits on GitHub
          </span>
        )}
      </figcaption>
    </figure>
  );
}
