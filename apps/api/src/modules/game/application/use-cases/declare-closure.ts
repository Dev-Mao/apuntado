import type { Clock } from "../../../../shared/clock.js";
import type { ClosureDeclaration, ValidationResult } from "../../domain/rules/game-rule.js";
import { invalid } from "../../domain/rules/game-rule.js";
import type { RuleResolver } from "../../domain/rules/rule-resolver.js";
import type { EventBus, GameRepository, PlayJournal } from "../ports/index.js";
import { GAME_NOT_FOUND, journalEntry, publishEvents } from "./session-effects.js";

export interface DeclareClosureCommand {
  readonly gameId: string;
  readonly playerId: string;
  readonly declaration: ClosureDeclaration;
}

export class DeclareClosure {
  constructor(
    private readonly games: GameRepository,
    private readonly rules: RuleResolver,
    private readonly journal: PlayJournal,
    private readonly events: EventBus,
    private readonly clock: Clock,
  ) {}

  execute({ gameId, playerId, declaration }: DeclareClosureCommand): ValidationResult {
    const session = this.games.find(gameId);
    if (!session) return invalid(GAME_NOT_FOUND);
    const rule = this.rules.resolve(declaration.type, session.enabledClosures);
    if (!rule) return invalid("La modalidad de cierre no está habilitada");
    const result = session.declareClosure(playerId, declaration, rule);
    if (!result.valid) return result;
    this.journal.record(journalEntry(session, playerId, "DECLARAR_CIERRE", declaration.discard, this.clock));
    this.games.save(session);
    publishEvents(session, this.events);
    return result;
  }
}
