import { ApuntadoRule } from "./apuntado-rule.js";
import { ClassicRule } from "./classic-rule.js";
import type { ClosureType, GameRule } from "./game-rule.js";

/**
 * ResolutorDeReglas — selecciona la regla aplicable según la configuración de la partida.
 * Es el registro (registry) del punto de extensión: agregar una variante es registrar
 * una implementación más, sin tocar la máquina de estados ni el orquestador.
 */
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
