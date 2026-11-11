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
  const hm = ready ? `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}` : "--:--";
  const ss = ready ? pad(sec % 60) : "--";
  const text = `${hm}:${ss}`;
  const state = running ? "running" : ms ? "paused" : "idle";

  // Show the time in the browser tab too, so it is visible from any other window.
  useEffect(() => {
    const base = document.title.replace(/^[●⏸] \d\d:\d\d:\d\d · /, "");
    document.title = running ? `● ${text} · ${base}` : base;
    return () => { document.title = base; };
  }, [running, text]);

  return (
    <div className="session-clock" data-state={state} role="group" aria-label="Session clock"
      style={{ "--sec": (ms % 60_000) / 60_000 } as React.CSSProperties}>
      <span className="clock-dot" aria-hidden="true" />
      <div className="clock-read">
        <span className="clock-label">{running ? "Working" : ms ? "Paused" : "Session clock"}</span>
        <time role="timer" dateTime={`PT${sec}S`}>{hm}<small>:{ss}</small></time>
      </div>
      {state === "paused" && (
        <button type="button" className="clock-btn quiet" aria-label="Reset clock" title="Reset" onClick={() => set({ start: null, acc: 0 })}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg>
        </button>
      )}
      <button type="button" className="clock-btn" aria-label={running ? "Pause" : ms ? "Resume" : "Start working"} title={running ? "Pause" : ms ? "Resume" : "Start working"}
        onClick={() => set(running ? { start: null, acc: ms } : { start: Date.now(), acc: s.acc })}>
        {running
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12" /></svg>
          : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" className="fill" /></svg>}
      </button>
      <span className="clock-tick" aria-hidden="true" />
    </div>
  );
}
