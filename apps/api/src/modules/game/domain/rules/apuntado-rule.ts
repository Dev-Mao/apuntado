import { isSet, noCardReused } from "../services/hand-evaluator.js";
import { pointsOf } from "../services/score-calculator.js";
import {
  type ClosureDeclaration, type GameRule, type ValidationResult, invalid, valid,
} from "./game-rule.js";

/** Límite de puntos de las cartas sobrantes al tocar. */
export const LEFTOVER_LIMIT = 5;

/**
 * ReglaApuntado101 — "tocar": tres ternas y cartas sobrantes que sumen menos de 5.
 * El número de sobrantes es libre: una o varias; solo importa la suma.
 * El umbral de 101 NO vive aquí: pertenece a ConfiguracionDeReglas y a PoliticaDeEliminacion.
 * No conoce ni importa la regla clásica (gobernanza: reglas independientes).
 */
export class ApuntadoRule implements GameRule {
  readonly type = "APUNTADO" as const;

  validate(d: ClosureDeclaration): ValidationResult {
    if (d.melds.length !== 3) return invalid("El apuntado requiere exactamente tres ternas");
    if (!noCardReused(d.melds)) return invalid("Una carta participa en más de una combinación");
    if (!d.melds.every(isSet)) return invalid("Alguna de las combinaciones no es una terna");

    const leftoverPoints = pointsOf(d.leftovers);
    if (leftoverPoints >= LEFTOVER_LIMIT) {
      return invalid(`Las cartas sobrantes suman ${leftoverPoints}; deben sumar menos de ${LEFTOVER_LIMIT}`, leftoverPoints);
    }
    return valid(leftoverPoints);
  }
}
