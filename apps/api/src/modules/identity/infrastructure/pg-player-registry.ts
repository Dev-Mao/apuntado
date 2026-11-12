import type { Database } from "../../../shared/database/database.js";
import type { PlayerRegistry } from "../application/ports.js";
import type { Player } from "../domain/player.js";

const UPSERT_GUEST = `
INSERT INTO jugador (id, apodo, tipo) VALUES ($1, $2, 'INVITADO')
ON CONFLICT (id) DO UPDATE SET apodo = EXCLUDED.apodo
WHERE jugador.tipo = 'INVITADO'`;

export class PgPlayerRegistry implements PlayerRegistry {
  constructor(private readonly database: Database) {}

  remember(player: Player): void {
    if (player.kind !== "INVITADO") return;
    this.database.queue.enqueue(async () => {
      await this.database.sql.query(UPSERT_GUEST, [player.id, player.nickname]);
    });
  }
}
