import { isQuarta, isSet, noCardReused } from "../services/hand-evaluator.js";
import {
  type ClosureDeclaration, type GameRule, type ValidationResult, invalid, valid,
} from "./game-rule.js";

/**
 * ReglaClasicaCuartaTerna — cierre 4-3-3: una cuarta, dos ternas y una carta de descarte.
 * No conoce ni importa la regla del apuntado (gobernanza: reglas independientes).
 */
export class ClassicRule implements GameRule {
  readonly type = "CLASICO" as const;

  validate(d: ClosureDeclaration): ValidationResult {
    if (d.melds.length !== 3) return invalid("El cierre clásico requiere tres combinaciones");
    if (!noCardReused(d.melds)) return invalid("Una carta participa en más de una combinación");
    if (d.discard === null) return invalid("El cierre clásico requiere descartar una carta");
    if (d.leftovers.length > 0) return invalid("El cierre clásico no admite cartas sobrantes");

    const quartas = d.melds.filter(isQuarta);
    const sets = d.melds.filter(isSet);
    if (quartas.length !== 1) return invalid("Debe haber exactamente una cuarta");
    if (sets.length !== 2) return invalid("Debe haber exactamente dos ternas");
    return valid();
  }
}
