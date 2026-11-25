const PANEL = { x: 10, y: 10, width: 80, height: 120 };
const LATTICE_GAP = 10;
const LATTICE_OFFSETS = Array.from({ length: (PANEL.width + PANEL.height) / LATTICE_GAP + 1 }, (_, index) => index * LATTICE_GAP - PANEL.height);

function Lattice() {
  return (
    <svg {...PANEL} className="stroke-card/35" strokeWidth={0.8}>
      {LATTICE_OFFSETS.map((offset) => (
        <g key={offset}>
          <line x1={offset} y1={0} x2={offset + PANEL.height} y2={PANEL.height} />
          <line x1={PANEL.width - offset} y1={0} x2={PANEL.width - offset - PANEL.height} y2={PANEL.height} />
        </g>
      ))}
    </svg>
  );
}

function Crown({ flipped = false }: { flipped?: boolean }) {
  return (
    <g transform={flipped ? "rotate(180 50 70)" : undefined}>
      <path d="M37 59.6V50l6.5 5L50 46l6.5 9 6.5-5v9.6z" className="fill-card" />
      <rect x={37} y={61} width={26} height={5} rx={1} className="fill-card" />
      <circle cx={37} cy={49} r={1.8} className="fill-card" />
      <circle cx={50} cy={44.6} r={2} className="fill-card" />
      <circle cx={63} cy={49} r={1.8} className="fill-card" />
      <path d="M50 61.6l1.9 1.9-1.9 1.9-1.9-1.9z" className="fill-suit-red" />
    </g>
  );
}

export function CardBack() {
  return (
    <span className="absolute inset-0 bg-card">
      <svg viewBox="0 0 100 140" className="absolute inset-0 size-full">
        <rect x={5} y={5} width={90} height={130} rx={5} className="fill-suit-red" />
        <Lattice />
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.width} height={PANEL.height} rx={3} fill="none" className="stroke-card" strokeWidth={1.2} />
        <ellipse cx={50} cy={70} rx={25} ry={34} className="fill-suit-red stroke-card" strokeWidth={1.6} />
        <ellipse cx={50} cy={70} rx={21} ry={30} fill="none" className="stroke-card" strokeWidth={0.6} />
        <line x1={33} y1={70} x2={67} y2={70} className="stroke-card" strokeWidth={0.8} />
        <Crown />
        <Crown flipped />
      </svg>
    </span>
  );
}
