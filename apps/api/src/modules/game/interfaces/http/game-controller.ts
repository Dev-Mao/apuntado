import type { DeclareClosure, DeclareClosureCommand } from "../../application/use-cases/declare-closure.js";

export class GameController {
  constructor(private readonly declareClosure: DeclareClosure) {}

  postClosure(command: DeclareClosureCommand): { status: number; body: unknown } {
    const result = this.declareClosure.execute(command);
    return result.valid
      ? { status: 200, body: { ok: true } }
      : { status: 422, body: { ok: false, reason: result.reason } };
  }
}
