// Build phases in the order they happened. New phases can be appended here.
export const PHASES = [
  { id: "research", label: "Research & parts" },
  { id: "design", label: "First sketches" },
  { id: "cad", label: "CAD design" },
  { id: "pcb", label: "PCB design" },
  { id: "landing", label: "Landing station" },
  { id: "firmware", label: "Firmware & cockpit" },
  { id: "docs", label: "Documentation" },
  { id: "testing", label: "Flight tests" },
  { id: "forest", label: "Forest drone" },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];

export const phaseLabel = (id: string) => PHASES.find((p) => p.id === id)?.label ?? id;
