// Hero backdrop: a topographic survey map with the build's flight path drawn across it.
// Each waypoint is one journal session; hover or focus it to see which, click to read it.
import { formatDuration } from "@/lib/markdown";

const W = 1400;
const H = 760;

export type Waypoint = { slug: string; title: string; date: string; minutes: number };

// Deterministic wobble so the map is identical on every render.
const wobble = (a: number, k: number, seed: number) =>
  Math.sin(a * 3 + seed) * 0.08 + Math.sin(a * 5 + k * 0.7 + seed) * 0.05 + Math.sin(a * 2 - k * 0.4) * 0.06;

function hill(cx: number, cy: number, rings: number, step: number, seed: number) {
  return Array.from({ length: rings }, (_, k) => {
    const r = 18 + k * step;
    const pts = Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const rr = r * (1 + wobble(a, k, seed));
      return `${(cx + Math.cos(a) * rr * 1.35).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    });
    return `M${pts.join("L")}Z`;
  });
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Berlin" });
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export function ContourMap({ sessions }: { sessions: Waypoint[] }) {
  const lines = [...hill(1040, 300, 15, 26, 1), ...hill(260, 640, 9, 30, 4), ...hill(820, 820, 6, 34, 7)];

  // Flight path meanders from bottom left to the summit on the right.
  const n = Math.max(sessions.length, 2);
  const way = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [120 + t * 920 + Math.sin(t * 9) * 40, 690 - t * 390 + Math.sin(t * 13 + 1) * 46] as const;
  });
  const path = way.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const [lx, ly] = way[n - 1];

  return (
    <svg className="contour-map" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="group" aria-label="Flight path: one point per build session">
      <g className="contours" aria-hidden="true">
        {lines.map((d, i) => (
          <path key={i} d={d} className={i % 5 === 4 ? "index-line" : undefined} />
        ))}
      </g>
      <path d={path} className="flight-path" pathLength={1} aria-hidden="true" />
      <circle cx={lx} cy={ly} r={9} className="here" aria-hidden="true" />
      <g className="waypoints">
        {sessions.map((s, i) => {
          const [x, y] = way[i];
          const title = clip(s.title, 40);
          const meta = `Session ${i + 1}, ${shortDate(s.date)}, ${formatDuration(s.minutes)}`;
          const w = Math.max(title.length * 7.6, meta.length * 6.6) + 28;
          const left = x > W - w - 40; // flip the label so it stays on screen
          const bx = left ? x - w - 14 : x + 14;
          const by = y - 62;
          return (
            <a key={s.slug} href={`/journal/${s.slug}`} className="wp" aria-label={`Session ${i + 1}: ${s.title}`}>
              <circle cx={x} cy={y} r={16} className="hit" />
              <circle cx={x} cy={y} r={3.4} className="dot" style={{ animationDelay: `${0.4 + (i / n) * 2.2}s` }} />
              <g className="tip" aria-hidden="true">
                <rect x={bx} y={by} width={w} height={50} rx={6} />
                <text x={bx + 14} y={by + 21} className="tip-title">{title}</text>
                <text x={bx + 14} y={by + 39} className="tip-meta">{meta}</text>
              </g>
            </a>
          );
        })}
      </g>
    </svg>
  );
}
