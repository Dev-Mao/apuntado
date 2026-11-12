import type { Database } from "../../../shared/database/database.js";
import type { AccountCreation, AccountStore, StoredAccount } from "../application/ports.js";
import type { Player } from "../domain/player.js";

const UNIQUE_VIOLATION = "23505";

const SAVE_ACCOUNT = `
INSERT INTO jugador (id, correo, hash_contrasena, apodo, tipo) VALUES ($1, $2, $3, $4, 'REGISTRADO')
ON CONFLICT (id) DO UPDATE
  SET correo = EXCLUDED.correo, hash_contrasena = EXCLUDED.hash_contrasena, apodo = EXCLUDED.apodo, tipo = 'REGISTRADO'
  WHERE jugador.tipo = 'INVITADO'
RETURNING id`;

const FIND_BY_EMAIL = "SELECT id, apodo, hash_contrasena FROM jugador WHERE correo = $1 AND tipo = 'REGISTRADO'";
const EMAIL_IN_USE = "SELECT 1 FROM jugador WHERE correo = $1";

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === UNIQUE_VIOLATION;

export class PgAccountStore implements AccountStore {
  readonly available = true;

  constructor(private readonly database: Database) {}

  async emailInUse(email: string): Promise<boolean> {
    return (await this.database.sql.query(EMAIL_IN_USE, [email])).length > 0;
  }

  async register(player: Player, email: string, passwordHash: string): Promise<AccountCreation> {
    try {
      const saved = await this.database.sql.query(SAVE_ACCOUNT, [player.id, email, passwordHash, player.nickname]);
      return saved.length > 0 ? "CREATED" : "PLAYER_TAKEN";
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
