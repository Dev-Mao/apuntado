import { cn, isRedSuit } from "@/lib";

import { PIP_LAYOUT } from "./card-pips";
import { SuitGlyph } from "./suit-glyph";

import type { CardDto } from "@apuntado/contracts";

function CardIndex({ card, className }: { card: CardDto; className: string }) {
  return (
    <span className={cn("absolute flex w-[18%] flex-col items-center", className)}>
      <span
        className={cn(
          "font-display text-[length:24cqw] leading-[0.85] font-bold",
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

function CardCenter({ card }: { card: CardDto }) {
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
      <span className="card-back absolute inset-[5%] rounded-[5%/3.6%]" />
    </span>
  );
}
