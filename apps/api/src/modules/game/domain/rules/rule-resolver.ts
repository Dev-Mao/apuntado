import { ApuntadoRule } from "./apuntado-rule.js";
import { ClassicRule } from "./classic-rule.js";
import type { ClosureType, GameRule } from "./game-rule.js";

export class RuleResolver {
  private readonly rules = new Map<ClosureType, GameRule>();

  constructor(rules: readonly GameRule[] = [new ClassicRule(), new ApuntadoRule()]) {
    for (const rule of rules) this.rules.set(rule.type, rule);
  }

  register(rule: GameRule): void {
    this.rules.set(rule.type, rule);
  }

  resolve(type: ClosureType, enabled: readonly ClosureType[]): GameRule | null {
    if (!enabled.includes(type)) return null;
    return this.rules.get(type) ?? null;
  }
}
