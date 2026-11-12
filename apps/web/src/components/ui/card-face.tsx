import { cn, FACE_RANKS, isRedSuit } from "@/lib";

import { PIP_LAYOUT } from "./card-pips";
import { SuitGlyph } from "./suit-glyph";

import type { CardDto } from "@apuntado/contracts";

function CardIndex({ card, className }: { card: CardDto; className: string }) {
  return (
    <span className={cn("absolute flex w-[18%] flex-col items-center", className)}>
      <span
        className={cn(
          "font-display text-[length:24cqw] leading-[0.85] font-medium",
          card.rank === "10" ? "-translate-x-[0.06em] tracking-[-0.12em]" : "tracking-tight",
        )}
      >
        {card.rank}
      </span>
      <SuitGlyph suit={card.suit} className="mt-[2cqw] size-[12cqw]" />
    </span>
  );
}

function Pips({ card }: { card: CardDto }) {
  const pips = PIP_LAYOUT[card.rank] ?? [];
  return (
    <span className="absolute inset-0">
      {pips.map(([x, y], index) => (
        <SuitGlyph
          key={index}
          suit={card.suit}
          className={cn("absolute size-[18cqw] -translate-1/2", y > 50 && "rotate-180")}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </span>
  );
}

function AcePip({ card }: { card: CardDto }) {
  return (
    <span className="absolute inset-0 grid place-items-center">
      <SuitGlyph suit={card.suit} className={card.suit === "S" ? "size-[50cqw]" : "size-[40cqw]"} />
    </span>
  );
}

function CourtHalf({ card, flipped }: { card: CardDto; flipped?: boolean }) {
  return (
    <span className={cn("absolute inset-0 flex flex-col items-start p-[8%]", flipped && "rotate-180")}>
      <span className="font-display text-[length:32cqw] leading-[0.8] font-medium italic">{card.rank}</span>
      <SuitGlyph suit={card.suit} className="mt-[3cqw] ml-[2cqw] size-[12cqw]" />
    </span>
  );
}

function CourtFrame({ card }: { card: CardDto }) {
  return (
    <span className="absolute inset-x-[20%] inset-y-[13%] overflow-hidden rounded-[5%/3.5%] border border-current/40 bg-[repeating-linear-gradient(135deg,transparent_0_2.6cqw,color-mix(in_srgb,currentColor_12%,transparent)_2.6cqw_3.2cqw)]">
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_calc(50%-0.5px),color-mix(in_srgb,currentColor_45%,transparent)_50%,transparent_calc(50%+0.5px))]" />
      <CourtHalf card={card} />
      <CourtHalf card={card} flipped />
    </span>
  );
}

function CardCenter({ card }: { card: CardDto }) {
  if (FACE_RANKS.includes(card.rank)) return <CourtFrame card={card} />;
  if (card.rank === "A") return <AcePip card={card} />;
  return <Pips card={card} />;
}

export function CardFace({ card }: { card: CardDto }) {
  return (
    <span className={cn("absolute inset-0 bg-card", isRedSuit(card.suit) ? "text-suit-red" : "text-ink")}>
      <CardCenter card={card} />
      <CardIndex card={card} className="top-[4.5%] left-[3%]" />
      <CardIndex card={card} className="right-[3%] bottom-[4.5%] rotate-180" />
    </span>
  );
}

export function CardBack() {
  return (
    <span className="absolute inset-0 bg-card">
      <span className="card-back absolute inset-[6%] grid place-items-center rounded-[5%/3.6%] shadow-[inset_0_0_0_1px_rgb(246_238_223/0.7)]">
        <span className="grid size-[44cqw] place-items-center rounded-full border border-card/70 bg-coral text-card">
          <SuitGlyph suit="C" className="size-[24cqw]" />
        </span>
      </span>
    </span>
  );
}
