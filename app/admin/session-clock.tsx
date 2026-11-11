"use client";

import { useEffect, useState } from "react";

// A stopwatch that floats on every admin page. It stores timestamps, not a counter, so it keeps
// real time across page changes, reloads, a sleeping laptop and closed tabs.
const KEY = "odonata-session-clock";
type State = { start: number | null; acc: number }; // start = when it last began running, acc = ms banked before that

const load = (): State => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "");
    if (typeof s.acc === "number") return { start: typeof s.start === "number" ? s.start : null, acc: s.acc };
  } catch {}
  return { start: null, acc: 0 };
};
const elapsed = (s: State) => s.acc + (s.start ? Math.max(0, Date.now() - s.start) : 0);
const pad = (n: number) => String(n).padStart(2, "0");

// Whole minutes on the clock right now; the entry form uses this for "Time worked".
export const clockMinutes = () => Math.round(elapsed(load()) / 60_000);

export function SessionClock() {
  const [s, setS] = useState<State>({ start: null, acc: 0 });
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setS(load());
    setNow(Date.now());
    setReady(true);
    // Another tab started or paused it.
    const sync = (e: StorageEvent) => e.key === KEY && setS(load());
    addEventListener("storage", sync);
    return () => removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!s.start) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [s.start]);

  const set = (next: State) => {
    setS(next);
    setNow(Date.now());
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  const ms = s.acc + (s.start ? Math.max(0, now - s.start) : 0);
  const sec = Math.floor(ms / 1000);
  const running = s.start !== null;
  const text = ready ? `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}` : "--:--:--";

  // Show the time in the browser tab too, so it is visible from any other window.
  useEffect(() => {
    const base = document.title.replace(/^[●⏸] \d\d:\d\d:\d\d · /, "");
    document.title = running ? `● ${text} · ${base}` : base;
    return () => { document.title = base; };
  }, [running, text]);

  return (
    <div className="session-clock" data-running={running} aria-label="Session clock">
      <div className="clock-face" style={{ "--sec": (ms % 60_000) / 60_000 } as React.CSSProperties}>
        <time role="timer" dateTime={`PT${sec}S`}>{text}</time>
      </div>
      <div className="clock-buttons">
        <button type="button" className="tool" onClick={() => set(running ? { start: null, acc: ms } : { start: Date.now(), acc: s.acc })}>
          {running ? "Pause" : s.acc ? "Resume" : "Start working"}
        </button>
        {!running && s.acc > 0 && <button type="button" className="tool" onClick={() => set({ start: null, acc: 0 })}>Reset</button>}
      </div>
    </div>
  );
}
