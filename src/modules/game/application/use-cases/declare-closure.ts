import type { ClosureDeclaration, ValidationResult } from "../../domain/rules/game-rule.js";
import { invalid } from "../../domain/rules/game-rule.js";
import type { RuleResolver } from "../../domain/rules/rule-resolver.js";
import type { Clock } from "../../../../shared/clock.js";
import type { EventBus, GameRepository, PlayJournal } from "../ports/index.js";

export interface DeclareClosureCommand {
  readonly gameId: string;
  readonly playerId: string;
  readonly declaration: ClosureDeclaration;
}

/**
 * Caso de uso: orquesta, no decide. Verifica turno, delega la validación en la regla
 * y, solo si es válida, cambia el estado y notifica. Una jugada inválida no altera
 * el estado ni consume el turno (RN-03).
 */
export class DeclareClosure {
  constructor(
    private readonly games: GameRepository,
    private readonly rules: RuleResolver,
    private readonly journal: PlayJournal,
    private readonly events: EventBus,
    private readonly clock: Clock,
  ) {}

  execute(command: DeclareClosureCommand): ValidationResult {
    const game = this.games.find(command.gameId);
    if (game === null) return invalid("La partida no existe");
    if (game.currentPlayerId !== command.playerId) return invalid("No es su turno");

    const rule = this.rules.resolve(command.declaration.type, game.enabledClosures);
    if (rule === null) return invalid("La modalidad de cierre no está habilitada");

    const result = rule.validate(command.declaration);
    if (!result.valid) return result;

    this.journal.record({
      gameId: game.gameId,
      roundNumber: 1,
      playerId: command.playerId,
      action: "DECLARAR_CIERRE",
      cardId: null,
      occurredAt: this.clock.now(),
    });
    this.events.publish("RondaCerrada", { gameId: game.gameId, winnerId: command.playerId });
    return result;
  }
}
