import Link from "next/link";
import { getEntries } from "@/lib/journal";
import { PHASES } from "@/lib/phases";
import { formatDate, formatDuration } from "@/lib/markdown";
import { getCommits } from "@/lib/github";
import { CONTACT_EMAIL } from "@/lib/site";
import { ContourMap } from "./contour-map";
import { SessionCalendar } from "./session-calendar";

const berlinDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }); // YYYY-MM-DD
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
  { quote: "1 and a half hours of work for nothing T-T (ok, not for nothing, but nevermind)", context: "Forgetting to record a coding session", href: "/journal/2026-05-26-starting-coding-and-making-takeoff" },
];

export default async function Home() {
  const entries = getEntries();
  const repoCommits = await getCommits();
  const commits = repoCommits.reduce((s, r) => s + r.dates.length, 0);
  const commitsPerDay = new Map<string, number>();
  for (const r of repoCommits) for (const d of r.dates) {
    const k = berlinDay(d);
    commitsPerDay.set(k, (commitsPerDay.get(k) ?? 0) + 1);
  }
  const busiest = [...commitsPerDay].reduce<[string, number] | null>((a, b) => (!a || b[1] > a[1] ? b : a), null);
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
  const activeDays = new Set(entries.map((e) => berlinDay(e.date))).size;

  return (
    <>
      <section className="hero">
        <ContourMap sessions={entries} />
        <div className="hero-text">
          <h1>Odonata</h1>
          <p className="lede">
            I&rsquo;m building a drone that flies on its own. The first version lands itself on an AprilTag
            station.
          </p>
          <p className="next-goal">
            <a href="#forest">
              Next: a drone that spots bark beetle damage in forests &ndash; for Jugend forscht 2027.
            </a>
          </p>
          <div className="actions">
            <Link className="button" href="/journal">Read the build journal</Link>
            <a className="button quiet" href="#partners">Support the next step</a>
          </div>
        </div>
        <dl className="tally">
          <div><dt>hours logged</dt><dd>{Math.round(totalMinutes / 60)}</dd></div>
          <div><dt>sessions</dt><dd>{entries.length}</dd></div>
          <div><dt>photos & screenshots</dt><dd>{photos}</dd></div>
          {commits > 0 && <div><dt>commits on GitHub</dt><dd>{commits}</dd></div>}
        </dl>
        <p className="hero-hint">Each point on the path is a build session, bigger means longer. Point at one to see it.</p>
      </section>

      <section id="about" className="band chapter about" aria-labelledby="about-title">
        <div className="band-head">
          <p className="eyebrow">01 · About</p>
          <h2 id="about-title">Who&rsquo;s building it</h2>
          <p>
            I&rsquo;m Stefanos, a student from Bavaria, and I build Odonata myself, from CAD and PCB to code.
            In 2026 I became state winner in Bavaria (Landessieger) at Jugend forscht junior
            with <a href="https://signai.dev" target="_blank" rel="noopener">SignAI</a>, won Hack Club&rsquo;s
            <a href="https://moonshot.hackclub.com" target="_blank" rel="noopener">Moonshot</a>, and took part in <a href="https://fallout.hackclub.com/projects/130" target="_blank" rel="noopener">Fallout</a> in
            Shenzhen.
          </p>
        </div>
        <ul className="about-facts">
          <li><strong>Landessieger Bayern 2026</strong><span>Jugend forscht junior, with <a href="https://signai.dev" target="_blank" rel="noopener">SignAI</a></span></li>
          <li><strong>Winner, <a href="https://moonshot.hackclub.com" target="_blank" rel="noopener">Hack Club Moonshot</a></strong><span>Hack Club hackathon</span></li>
          <li><strong><a href="https://fallout.hackclub.com/projects/130" target="_blank" rel="noopener">Hack Club Fallout</a></strong><span>Shenzhen, with Odonata v1 as my project</span></li>
        </ul>
      </section>

      <section id="drone" className="band chapter" aria-labelledby="drone-title">
        <div className="machine">
          <figure className="machine-render">
            <img src="/project/render-hero.webp" alt="Rendered CAD model of Odonata: an X-frame drone with prop guards" />
          </figure>
          <div className="machine-text">
            <p className="eyebrow">02 · The drone</p>
            <h2 id="drone-title">Odonata v1</h2>
            <p>
              Built for Hack Club Fallout in spring 2026. A Raspberry Pi Zero 2 W does the thinking, a DarwinFPV
              F411 flight controller keeps it in the air, and a custom 4-layer PCB connects the two. The Pi talks
              to the flight controller over MAVLink, and a web cockpit on a laptop starts and stops flights.
            </p>
            <dl className="specs">
              <div><dt>Weight</dt><dd>about 300 g</dd></div>
              <div><dt>Thrust</dt><dd>about 1100 g, 3:1 to weight</dd></div>
              <div><dt>Battery</dt><dd>3S 850 mAh, about 5 min flight</dd></div>
              <div><dt>Sensing</dt><dd>4 ToF distance sensors, 130° camera on a servo</dd></div>
              <div><dt>Landing</dt><dd>AprilTag tracking, self-centring station</dd></div>
              <div><dt>Parts cost</dt><dd>€264.84 including shipping</dd></div>
            </dl>
            <a className="github-tile" href="https://github.com/Stefanos0710/Odonata" target="_blank" rel="noopener">
              <span className="github-tile-head">Code, CAD and PCB files on GitHub</span>
              <span className="github-tile-time">
                {Math.round(totalMinutes / 60)} hours logged{commits > 0 && <>, {commits} commits</>}
              </span>
            </a>
          </div>
        </div>

        <div className="sub-head">
          <h3>From sketch to first flight</h3>
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

      <section id="build" className="band chapter" aria-labelledby="build-title">
        <div className="band-head">
          <p className="eyebrow">03 · The build</p>
          <h2 id="build-title">The build, phase by phase</h2>
          <p>Every session is written up in the journal. Point at a day to see what happened.</p>
        </div>
        <div className="build-overview">
          <SessionCalendar entries={entries} />
          <dl className="build-facts">
            <div>
              <dt>Built between</dt>
              <dd>{shortDate(entries[0].date)} – {shortDate(entries[entries.length - 1].date)}</dd>
              <dd className="fact-note">{activeDays} days at the bench, across {spanDays} days</dd>
            </div>
            <div>
              <dt>Sessions</dt>
              <dd>{entries.length}</dd>
              <dd className="fact-note">{formatDuration(Math.round(totalMinutes / Math.max(entries.length, 1)))} on average</dd>
            </div>
            <div>
              <dt>Longest session</dt>
              <dd>{formatDuration(longest.minutes)}</dd>
              <dd className="fact-note"><Link href={`/journal/${longest.slug}`}>{longest.title}</Link></dd>
            </div>
            {busiest && (
              <div>
                <dt>Commits on GitHub</dt>
                <dd>{commits}</dd>
                <dd className="fact-note">Most in one day: {busiest[1]}, on {shortDate(busiest[0] + "T12:00:00Z")}</dd>
              </div>
            )}
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

        <div className="setbacks">
          <div className="sub-head">
            <h3>Not everything worked the first time</h3>
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
        </div>
      </section>

      <section id="forest" className="forest band chapter" aria-labelledby="forest-title">
        <div className="band-head">
          <p className="eyebrow">04 · What&rsquo;s next</p>
          <h2 id="forest-title">Next: into the forest</h2>
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
        <p className="forest-need">
          <strong>What it needs:</strong> an NVIDIA Jetson Orin NX 16GB for on-board AI.{" "}
          <a href="#partners">See how you can help</a>
        </p>
        <p className="forest-note">This part is just starting. Progress will show up in the journal as it happens.</p>
      </section>

      <section id="partners" className="partners band chapter" aria-labelledby="partners-title">
        <div className="band-head">
          <p className="eyebrow">05 · Partners</p>
          <h2 id="partners-title">Help Odonata into the forest</h2>
          <p>
            Odonata&rsquo;s next step is flying through real forest without GPS or ground markers. For that it needs
            on-board AI: an NVIDIA Jetson Orin NX 16GB to run two depth cameras and one RGB camera on the drone
            itself. I&rsquo;m looking for partners to support this step for Jugend forscht 2027.
          </p>
        </div>
        <div className="partners-body">
          <div className="needed">
            <h3>What&rsquo;s needed</h3>
            <p>
              <strong>An NVIDIA Jetson Orin NX 16GB.</strong> Under the canopy there is no GPS and there are no
              ground markers, so the drone has to see and decide on its own: two depth cameras to avoid trunks and
              branches, and one RGB camera to spot infestation, all processed on board and in real time. The small
              single-board computer on v1 is far too slow for that.
            </p>
          </div>
          <div className="perks-box">
            <h3>Partners get</h3>
            <ul className="perks">
              <li>Their logo here on odonata.dev</li>
              <li>Their logo on my competition poster and stand at Jugend forscht 2027</li>
              <li>A credit in my written report</li>
              <li>A build write-up showing what their support made possible</li>
            </ul>
          </div>
        </div>
        <div className="partners-foot">
          <ul className="logo-wall" aria-label="Partner logos">
            <li className="logo-slot">Your logo here</li>
          </ul>
          <p className="partners-cta">
            <span>Interested?</span>
            <a className="button" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Partnering with Odonata")}`}>Write to me</a>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Partnering with Odonata")}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>

      <section id="latest" className="band chapter" aria-labelledby="latest-title">
        <div className="band-head row">
          <div>
            <p className="eyebrow">06 · Journal</p>
            <h2 id="latest-title">Latest from the journal</h2>
          </div>
          <Link href="/journal">All {entries.length} entries</Link>
        </div>
        <ul className="cards">
          {latest.map((e) => (
            <li key={e.slug}>
              <Link href={`/journal/${e.slug}`}>
                {e.cover && <img src={e.cover} alt={`Cover photo: ${e.title}`} loading="lazy" />}
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
