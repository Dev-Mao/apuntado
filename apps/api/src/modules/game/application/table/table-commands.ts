import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { RoomRepository } from "../ports/index.js";
import type { DeclareClosure } from "../use-cases/declare-closure.js";
import type { DiscardCard } from "../use-cases/discard-card.js";
import type { DrawCard } from "../use-cases/draw-card.js";
import { parseCard, parseDeclaration } from "./payload-parser.js";
import type { TableCoordinator } from "./table-coordinator.js";

export interface TableCommandDependencies {
  readonly rooms: RoomRepository;
  readonly draw: DrawCard;
  readonly discard: DiscardCard;
  readonly declare: DeclareClosure;
  readonly coordinator: TableCoordinator;
}

export class TableCommands {
  constructor(private readonly deps: TableCommandDependencies) {}

  draw(playerId: string, source: unknown): Outcome {
    if (source !== "STOCK" && source !== "DISCARD") return rejected("Origen de robo inválido");
    return this.onTable(playerId, (gameId) => this.deps.draw.execute({ gameId, playerId, source }));
  }

  discard(playerId: string, rawCard: unknown): Outcome {
    const card = parseCard(rawCard);
    if (!card) return rejected("Carta inválida");
    return this.onTable(playerId, (gameId) => this.deps.discard.execute({ gameId, playerId, card }));
  }

  declare(playerId: string, rawDeclaration: unknown): Outcome {
    const declaration = parseDeclaration(rawDeclaration);
    if (!declaration) return rejected("Declaración de cierre inválida");
    return this.onTable(playerId, (gameId) => {
      const result = this.deps.declare.execute({ gameId, playerId, declaration });
      return result.valid ? { ok: true } : rejected(result.reason ?? "Cierre inválido");
    });
  }

  private onTable(playerId: string, action: (gameId: string) => Outcome): Outcome {
    const room = this.deps.rooms.findActiveByPlayer(playerId);
    if (!room || room.status !== "PLAYING") return rejected("No está jugando en ninguna mesa");
    const outcome = action(room.code);
    if (outcome.ok) this.deps.coordinator.refresh(room.code);
    return outcome;
  }
}
