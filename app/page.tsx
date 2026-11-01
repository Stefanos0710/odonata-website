import Link from "next/link";
import { getEntries } from "@/lib/journal";
import { PHASES } from "@/lib/phases";
import { formatDate, formatDuration } from "@/lib/markdown";
import { getCommitCounts } from "@/lib/github";
import { ContourMap } from "./contour-map";
import { SessionCalendar } from "./session-calendar";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Berlin" });

// Key moments, in build order. Links point at the session where each one happened.
const FILMSTRIP = [
  { src: "/journal/3825/02.webp", alt: "Pencil sketch of the X-frame on graph paper with an octagon base", caption: "A 1:2 sketch on graph paper", href: "/journal/2026-04-25-drawing-the-first-design-of-the-drone" },
  { src: "/project/assembly.webp", alt: "Rendered CAD assembly of the drone and its landing station", caption: "Every part modelled in Fusion 360", href: "/journal/2026-05-08-finishing-the-drone-cad-adding-the-prop-guards" },
  { src: "/project/pcb-layer1.webp", alt: "Top copper layer of the drone PCB in KiCad", caption: "A 4-layer PCB, routed by hand", href: "/journal/2026-05-21-finished-the-pcb" },
  { src: "/project/pcb-front.webp", alt: "3D render of the finished PCB with the Odonata logo", caption: "The board that ties Pi and flight controller together", href: "/journal/2026-05-23-finding-name-and-finishing-the-pcb" },
  { src: "/project/cockpit.webp", alt: "The web cockpit with sensor readings and motor controls", caption: "A web cockpit to test motors and start flights", href: "/journal/2026-05-28-finishing-the-drone-code-and-starting-with-the-server" },
  { src: "/project/first-flight.webp", alt: "Odonata lifting off above AprilTag markers", caption: "First flight", href: "https://www.youtube.com/shorts/tDMgUdCkJ7U" },
];

// Straight from the journal, unedited.
const SETBACKS = [
  { quote: "It felt like building one decision always breaks another decision...", context: "Choosing parts that all fit together", href: "/journal/2026-04-22-find-out-the-basics-and-plan-the-fundamental" },
  { quote: "I worked on this mechanism for 5 hours and now everything was for the trash", context: "The tilting camera mount, before the redesign that worked", href: "/journal/2026-05-04-building-the-camera-and-servo-mechanism" },
  { quote: "1 and a half hours of work for nothing T-T (ok, not for nothing, but nevermind)", context: "Forgetting to record a coding session", href: "/journal/2026-05-26-starting-coding-and-making-takoff" },
];

export default async function Home() {
  const entries = getEntries();
  const repos = await getCommitCounts();
  const commits = repos.reduce((s, r) => s + r.commits, 0);
  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0);
  const photos = entries.reduce((s, e) => s + e.images, 0);

  const phases = PHASES.map((p) => {
    const list = entries.filter((e) => e.phase === p.id);
    return { ...p, list, minutes: list.reduce((s, e) => s + e.minutes, 0) };
  }).filter((p) => p.list.length);
  const maxPhase = Math.max(...phases.map((p) => p.minutes), 1);
  const latest = entries.slice(-3).reverse();
  const longest = entries.reduce((a, b) => (b.minutes > a.minutes ? b : a), entries[0]);
  const spanDays = entries.length
    ? Math.round((Date.parse(entries[entries.length - 1].date) - Date.parse(entries[0].date)) / 86_400_000) + 1
    : 0;
  const activeDays = new Set(entries.map((e) => new Date(e.date).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }))).size;

  return (
    <>
      <section className="hero">
        <ContourMap sessions={entries} />
        <div className="hero-text">
          <h1>Odonata</h1>
          <p className="lede">
            I&rsquo;m building a drone that flies on its own. The first version lands itself on an AprilTag
            station. The next one should fly through a forest and find trees hit by bark beetles.
          </p>
          <div className="actions">
            <Link className="button" href="/journal">Read the build journal</Link>
            <a className="button quiet" href="#build">See where it stands</a>
          </div>
        </div>
        <dl className="tally">
          <div><dt>hours logged</dt><dd>{Math.round(totalMinutes / 60)}</dd></div>
          <div><dt>sessions</dt><dd>{entries.length}</dd></div>
          <div><dt>photos & screenshots</dt><dd>{photos}</dd></div>
          {commits > 0 && <div><dt>commits on GitHub</dt><dd>{commits}</dd></div>}
        </dl>
        <p className="hero-hint">Each point on the path is a build session. Point at one to see it.</p>
      </section>

      <section id="build" className="band">
        <div className="band-head">
          <h2>The build, phase by phase</h2>
          <p>Every session is written up in the journal. Point at a day to see what happened.</p>
        </div>
        <div className="build-overview">
          <SessionCalendar entries={entries} />
          <dl className="build-facts">
            <div><dt>From first to last session</dt><dd>{spanDays} days</dd></div>
            <div><dt>Days with a build session</dt><dd>{activeDays} of {spanDays}</dd></div>
            <div><dt>Average session</dt><dd>{formatDuration(Math.round(totalMinutes / Math.max(entries.length, 1)))}</dd></div>
            <div>
              <dt>Longest session</dt>
              <dd>{formatDuration(longest.minutes)}</dd>
              <dd className="fact-note"><Link href={`/journal/${longest.slug}`}>{longest.title}</Link></dd>
            </div>
          </dl>
        </div>
        <ol className="phases">
          {phases.map((p) => (
            <li key={p.id}>
              <Link href={`/journal#${p.id}`}>
                <span className="phase-name">{p.label}</span>
                <span className="phase-dates">
                  {shortDate(p.list[0].date)}
                  {p.list.length > 1 && <>&ndash;{shortDate(p.list[p.list.length - 1].date)}</>}
                </span>
                <span className="phase-bar" style={{ "--w": p.minutes / maxPhase } as React.CSSProperties} />
                <span className="phase-hours">
                  {formatDuration(p.minutes)}, {p.list.length} {p.list.length === 1 ? "session" : "sessions"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="band filmstrip-band" aria-labelledby="filmstrip-title">
        <div className="band-head row">
          <h2 id="filmstrip-title">From sketch to first flight</h2>
          <p>Scroll sideways. Each picture opens the session it came from.</p>
        </div>
        <ol className="filmstrip">
          {FILMSTRIP.map((f, i) => (
            <li key={f.src}>
              <a href={f.href} {...(f.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                <img src={f.src} alt={f.alt} loading="lazy" />
                <span className="frame-no">{i + 1}</span>
                <span className="frame-caption">{f.caption}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="machine band">
        <figure className="machine-render">
          <img src="/project/render-hero.webp" alt="Rendered CAD model of Odonata: an X-frame drone with prop guards" />
        </figure>
        <div className="machine-text">
          <h2>Odonata v1</h2>
          <p>
            Built for Hack Club Fallout in spring 2026. A Raspberry Pi Zero 2 W does the thinking, a DarwinFPV
            F411 flight controller keeps it in the air, and a custom 4-layer PCB connects the two. The Pi talks
            to the flight controller over MAVLink, and a web cockpit on a laptop starts and stops flights.
          </p>
          <dl className="specs">
            <div><dt>Weight</dt><dd>about 300 g</dd></div>
            <div><dt>Thrust</dt><dd>about 1100 g, 3 : 1 to weight</dd></div>
            <div><dt>Battery</dt><dd>3S 850 mAh, about 5 min flight</dd></div>
            <div><dt>Sensing</dt><dd>4 ToF distance sensors, 130° camera on a servo</dd></div>
            <div><dt>Landing</dt><dd>AprilTag tracking, self-centring station</dd></div>
            <div><dt>Parts cost</dt><dd>€264.84 including shipping</dd></div>
          </dl>
          <a className="github-tile" href="https://github.com/Stefanos0710/Odonata" target="_blank" rel="noopener">
            <span className="github-tile-head">Code, CAD and PCB files on GitHub</span>
            <span className="github-tile-time">{Math.round(totalMinutes / 60)} hours logged</span>
            {repos.length > 0 && (
              <span className="github-tile-repos">
                {repos.map((r) => (
                  <span key={r.name}><b>{r.commits}</b> commits in {r.name}</span>
                ))}
              </span>
            )}
          </a>
        </div>
      </section>

      <section className="band setbacks">
        <div className="band-head">
          <h2>Not everything worked the first time</h2>
          <p>A few lines from the journal, written right after things went wrong.</p>
        </div>
        <ul>
          {SETBACKS.map((s) => (
            <li key={s.href}>
              <blockquote>{s.quote}</blockquote>
              <Link href={s.href}>{s.context}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="forest" className="forest band">
        <div className="band-head">
          <h2>Next: into the forest</h2>
          <p>
            For Jugend forscht 2027, Odonata leaves the living room. Bark beetles (Borkenkäfer) kill large areas
            of spruce every year, and an attack is easiest to stop when it is found early. Walking every stand to
            look for it takes a lot of time. A small drone could do a first pass.
          </p>
        </div>
        <ol className="goals">
          <li>
            <h3>Fly between the trees</h3>
            <p>Navigate under the canopy without GPS, using distance sensors and the camera to avoid trunks and branches.</p>
          </li>
          <li>
            <h3>Look at every trunk</h3>
            <p>Photograph bark and crowns along the route and detect signs of infestation: bore dust, entry holes, loose bark, browning needles.</p>
          </li>
          <li>
            <h3>Write the forest summary</h3>
            <p>Return with a report: which trees were checked, where suspicious ones stand, and how sure the detection is.</p>
          </li>
        </ol>
        <p className="forest-note">This part is just starting. Progress will show up in the journal as it happens.</p>
      </section>

      <section className="band">
        <div className="band-head row">
          <h2>Latest from the journal</h2>
          <Link href="/journal">All {entries.length} entries</Link>
        </div>
        <ul className="cards">
          {latest.map((e) => (
            <li key={e.slug}>
              <Link href={`/journal/${e.slug}`}>
                {e.cover && <img src={e.cover} alt="" loading="lazy" />}
                <span className="card-meta">{formatDate(e.date)}, {formatDuration(e.minutes)}</span>
                <span className="card-title">{e.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
