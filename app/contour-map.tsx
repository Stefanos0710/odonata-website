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
// Catmull-Rom spline through the waypoints, as cubic Béziers, so the path bends instead of zig-zagging.
function smooth(pts: readonly (readonly [number, number])[]) {
  const p = (i: number) => pts[Math.min(Math.max(i, 0), pts.length - 1)];
  let d = `M${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += `C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
  }
  return d;
}
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export function ContourMap({ sessions }: { sessions: Waypoint[] }) {
  const lines = [...hill(1180, 250, 15, 26, 1), ...hill(260, 640, 9, 30, 4), ...hill(820, 820, 6, 34, 7)];

  // Flight path climbs to the summit on the right, clear of the hero text on the left.
  const n = Math.max(sessions.length, 2);
  const way = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [1040 + t * 270 + Math.sin(t * 7) * 50, 690 - t * 510 + Math.sin(t * 11 + 1) * 22] as const;
  });
  const path = smooth(way);
  const [fx, fy] = way[0];
  const [lx, ly] = way[n - 1];
  const longest = Math.max(...sessions.map((s) => s.minutes), 1);

  return (
    <svg className="contour-map" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" role="group" aria-label="Flight path: one point per build session">
      <g className="contours" aria-hidden="true">
        {lines.map((d, i) => (
          <path key={i} d={d} className={i % 5 === 4 ? "index-line" : undefined} />
        ))}
      </g>
      <defs>
        <linearGradient id="flight-gradient" gradientUnits="userSpaceOnUse" x1={fx} y1={fy} x2={lx} y2={ly}>
          <stop offset="0" stopColor="var(--violet)" />
          <stop offset="1" stopColor="var(--lime)" />
        </linearGradient>
      </defs>
      <path d={path} className="flight-glow" pathLength={1} aria-hidden="true" />
      <path d={path} className="flight-path" pathLength={1} aria-hidden="true" />
      <g className="here" aria-hidden="true">
        <circle cx={lx} cy={ly} r={9} className="here-pulse" />
        <circle cx={lx} cy={ly} r={7} className="here-dot" />
      </g>
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
              <circle cx={x} cy={y} r={(2.6 + (s.minutes / longest) * 3.4).toFixed(1)} className="dot" style={{ animationDelay: `${0.4 + (i / n) * 2.2}s` }} />
              <g className="tip" aria-hidden="true">
                <rect x={bx} y={by} width={w} height={50} rx={8} />
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
