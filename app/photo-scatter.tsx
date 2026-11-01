// Footer collage: build photos dropped on the table. Each photo gets a cell on a loose grid, then a seeded
// jitter and tilt, so it looks random but stays balanced and renders the same on server and client.
const RECAP = "/journal/2026-11-01-the-big-recap";
const RENDER = "/journal/2026-05-29-starting-with-the-cad-organisation-and-making-the-render";
const STATION = "/journal/2026-05-25-fixing-pcb-cad-and-lastly-starting-and-finishing-the-landing";
const NAME = "/journal/2026-05-23-finding-name-and-finishing-the-pcb";
const GUARDS = "/journal/2026-05-08-finishing-the-drone-cad-adding-the-prop-guards";
const SERVO = "/journal/2026-05-04-building-the-camera-and-servo-mechanism";
const SKETCH = "/journal/2026-04-25-drawing-the-first-design-of-the-drone";

// Order mixes renders, photos, PCB shots and sketches so neighbours differ. Phones show the first 12.
const PHOTOS: { src: string; alt: string; href: string; portrait?: true }[] = [
  { src: "render", alt: "Rendered CAD model of Odonata", href: RENDER },
  { src: "sketch", alt: "Pencil sketch of the X-frame on graph paper", href: SKETCH },
  { src: "pcb-blue", alt: "The soldered Odonata PCB on a blue mat", href: RECAP, portrait: true },
  { src: "cad-guards", alt: "CAD model of the drone with prop guards", href: GUARDS },
  { src: "in-hand", alt: "The drone in hand with a Raspberry Pi 4B on top", href: RECAP, portrait: true },
  { src: "hackclub-art", alt: "Hack Club artwork on the back of the PCB", href: NAME },
  { src: "print-test", alt: "A 3D-printed test part for the camera mount", href: SERVO },
  { src: "station-lid", alt: "The landing station lid with the Odonata logo", href: STATION },
  { src: "soldered", alt: "Holding the soldered PCB", href: RECAP, portrait: true },
  { src: "apriltag", alt: "Camera test tracking an AprilTag", href: "/journal/2026-05-27-coding-the-apriltag-tracking-servo-and-the-battery-status" },
  { src: "prop-guard", alt: "A printed prop guard with a propeller", href: GUARDS },
  { src: "closeup", alt: "Close-up render of the drone body", href: RENDER },
  { src: "printing", alt: "3D printing the drone parts", href: RECAP, portrait: true },
  { src: "routing", alt: "Routing the PCB traces in KiCad", href: "/journal/2026-05-21-finished-the-pcb" },
  { src: "pcb-render", alt: "3D render of the finished PCB", href: NAME },
  { src: "traces", alt: "Close-up of the power traces on the PCB", href: NAME, portrait: true },
  { src: "sketch-colour", alt: "Coloured sketch of the drone base layout", href: SKETCH },
  { src: "frame", alt: "Render of the frame with the Odonata name cut out", href: RENDER },
  { src: "guards", alt: "Freshly printed prop guards and arms", href: RECAP, portrait: true },
  { src: "station-text", alt: "Landing station plate with engraved text", href: STATION },
  { src: "copper", alt: "Top copper layer of the PCB in KiCad", href: "/journal/2026-05-21-finished-the-pcb" },
  { src: "servo-horn", alt: "Render of the servo horn", href: SERVO },
  { src: "box", alt: "The drone after the crash", href: RECAP, portrait: true },
  { src: "pcb-3d", alt: "3D view of the PCB with components placed", href: "/journal/2026-05-14-fixing-schematics-problemserrors-and-placing-the-components" },
  { src: "station-render", alt: "Render of the drone sitting on its landing station", href: RENDER, portrait: true },
  { src: "cad-top", alt: "Top view of the drone CAD with the Pi in place", href: RENDER },
  { src: "pcb-odonata", alt: "PCB render with the Odonata name", href: STATION },
];

const rand = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** Left/top in % of the collage for a grid of `cols` columns whose rows start `step`% apart. */
function place(i: number, cols: number, step: number, width: number) {
  const cell = 100 / cols;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const stagger = row % 2 ? cell * 0.22 : -cell * 0.22;
  const x = (col + 0.5) * cell + stagger + (rand(i, 1) - 0.5) * cell * 0.6 - width / 2;
  const y = row * step + rand(i, 2) * step * 0.5;
  return { x: Math.min(Math.max(x, 0), 100 - width).toFixed(1), y: y.toFixed(1) };
}

export function PhotoScatter() {
  return (
    <ul className="scatter" aria-label="Photos from the build">
      {PHOTOS.map((p, i) => {
        const size = 0.85 + rand(i, 4) * 0.35; // prints of slightly different sizes
        const wide = place(i, 9, 25, (p.portrait ? 10 : 13) * size);
        const phone = place(i, 3, 21, (p.portrait ? 30 : 40) * size);
        const style = {
          "--x": `${wide.x}%`, "--y": `${wide.y}%`, "--mx": `${phone.x}%`, "--my": `${phone.y}%`,
          "--rot": `${((rand(i, 3) - 0.5) * 18).toFixed(1)}deg`, "--size": size.toFixed(2),
        } as React.CSSProperties;
        return (
          <li key={p.src} className={p.portrait ? "portrait" : undefined} style={style}>
            <a href={p.href}>
              <img src={`/footer/${p.src}.webp`} alt={p.alt} loading="lazy" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
