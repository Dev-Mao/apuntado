import type { Database } from "../../../shared/database/database.js";
import type { SqlExecutor } from "../../../shared/database/sql-client.js";
import type { AccountCreation, AccountStore, StoredAccount } from "../application/ports.js";
import type { Player } from "../domain/player.js";

const UNIQUE_VIOLATION = "23505";

const UPGRADE_GUEST = `
UPDATE jugador SET correo = $2, hash_contrasena = $3, apodo = $4, tipo = 'REGISTRADO'
WHERE id = $1 AND tipo = 'INVITADO'
RETURNING id`;

const INSERT_ACCOUNT = `
INSERT INTO jugador (id, correo, hash_contrasena, apodo, tipo) VALUES ($1, $2, $3, $4, 'REGISTRADO')
ON CONFLICT (id) DO NOTHING
RETURNING id`;

const FIND_BY_EMAIL = "SELECT id, apodo, hash_contrasena FROM jugador WHERE correo = $1 AND tipo = 'REGISTRADO'";

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === UNIQUE_VIOLATION;

const saveAccount = async (tx: SqlExecutor, params: readonly string[]): Promise<boolean> =>
  (await tx.query(UPGRADE_GUEST, params)).length > 0 || (await tx.query(INSERT_ACCOUNT, params)).length > 0;

export class PgAccountStore implements AccountStore {
  readonly available = true;

  constructor(private readonly database: Database) {}

  async register(player: Player, email: string, passwordHash: string): Promise<AccountCreation> {
    try {
      const params = [player.id, email, passwordHash, player.nickname];
      return (await saveAccount(this.database.sql, params)) ? "CREATED" : "EMAIL_TAKEN";
    } catch (error) {
      if (isUniqueViolation(error)) return "EMAIL_TAKEN";
      throw error;
    }
  }

  async findByEmail(email: string): Promise<StoredAccount | null> {
    const [row] = await this.database.sql.query<{ id: string; apodo: string; hash_contrasena: string }>(FIND_BY_EMAIL, [email]);
    return row ? { player: { id: row.id, nickname: row.apodo, kind: "REGISTRADO" }, passwordHash: row.hash_contrasena } : null;
  }
}
