import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Pruebas de integración del esquema relacional (ADR-04).
 * Se ejecutan sobre PostgreSQL real compilado a WebAssembly (PGlite): no requieren Docker
 * ni una instancia instalada. Verifican C-03 y C-04 del ADR-04: el esquema aplica sobre una
 * base limpia y las restricciones declarativas rechazan los casos inválidos en el motor.
 */
const SCHEMA = readFileSync(
  fileURLToPath(new URL("../../models/er/schema.sql", import.meta.url)),
  "utf8",
);

const J1 = "00000000-0000-0000-0000-000000000001";
const J2 = "00000000-0000-0000-0000-000000000002";
const PARTIDA = "10000000-0000-0000-0000-000000000001";
const PART1 = "20000000-0000-0000-0000-000000000001";
const RONDA = "30000000-0000-0000-0000-000000000001";
const MANO = "50000000-0000-0000-0000-000000000001";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SCHEMA);
  await db.exec(`
    INSERT INTO valor_carta VALUES ('A',1,1),('7',7,7),('K',10,13);
    INSERT INTO carta VALUES ('AH','A','H'),('7S','7','S'),('KD','K','D');
    INSERT INTO jugador (id,correo,hash_contrasena,apodo,tipo) VALUES
      ('${J1}','ana@x.co','h','Ana','REGISTRADO'),
      ('${J2}',NULL,NULL,'Invitado','INVITADO');
    INSERT INTO partida (id,modo,estado,config_reglas) VALUES
      ('${PARTIDA}','SALA_PRIVADA','EN_CURSO','{"umbral":101}');
    INSERT INTO participacion (id,partida_id,jugador_id,posicion) VALUES
      ('${PART1}','${PARTIDA}','${J1}',1);
    INSERT INTO ronda (id,partida_id,numero) VALUES ('${RONDA}','${PARTIDA}',1);
    INSERT INTO mano_jugador (id,ronda_id,participacion_id) VALUES ('${MANO}','${RONDA}','${PART1}');
  `);
}, 60_000);

afterAll(async () => {
  await db.close();
});

describe("C-03 · el esquema aplica sobre una base limpia", () => {
  it("crea las tablas y vistas del modelo", async () => {
    const { rows } = await db.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const nombres = rows.map((r) => r.table_name);
    for (const t of ["partida", "ronda", "puntaje_acumulado", "turno_jugada", "saldo_jugador"]) {
      expect(nombres).toContain(t);
    }
  });
});

describe("C-04 · el motor rechaza los casos inválidos", () => {
  it("liquidar dos veces la misma ronda para el mismo participante", async () => {
    const insertar = (id: string) =>
      db.exec(`INSERT INTO puntaje_acumulado (id,participacion_id,ronda_id,puntos_ronda,puntos_acumulados)
               VALUES ('${id}','${PART1}','${RONDA}',5,5)`);
    await insertar("40000000-0000-0000-0000-000000000001");
    await expect(insertar("40000000-0000-0000-0000-000000000002")).rejects.toThrow(/unique/i);
  });

  it("invitado con correo y contraseña", async () => {
    await expect(
      db.exec(`INSERT INTO jugador (id,correo,hash_contrasena,apodo,tipo)
               VALUES ('00000000-0000-0000-0000-000000000003','x@y.co','h','Raro','INVITADO')`),
    ).rejects.toThrow(/check/i);
  });

  it("registrado sin credenciales", async () => {
    await expect(
      db.exec(`INSERT INTO jugador (id,apodo,tipo)
               VALUES ('00000000-0000-0000-0000-000000000004','Sin','REGISTRADO')`),
    ).rejects.toThrow(/check/i);
  });

  it("dos participantes en la misma posición de la mesa", async () => {
    await expect(
      db.exec(`INSERT INTO participacion (id,partida_id,jugador_id,posicion)
               VALUES ('20000000-0000-0000-0000-000000000002','${PARTIDA}','${J2}',1)`),
    ).rejects.toThrow(/unique/i);
  });

  it("la misma ronda numerada dos veces", async () => {
    await expect(
      db.exec(`INSERT INTO ronda (id,partida_id,numero)
               VALUES ('30000000-0000-0000-0000-000000000002','${PARTIDA}',1)`),
    ).rejects.toThrow(/unique/i);
  });

  it("partida finalizada sin fecha de fin", async () => {
    await expect(
      db.exec(`INSERT INTO partida (id,modo,estado,config_reglas)
               VALUES ('10000000-0000-0000-0000-000000000002','VS_MAQUINA','FINALIZADA','{}')`),
    ).rejects.toThrow(/check/i);
  });

  it("carta con palo inválido", async () => {
    await expect(db.exec("INSERT INTO carta VALUES ('7X','7','X')")).rejects.toThrow(/check/i);
  });

  it("la misma carta dos veces en una mano", async () => {
    await db.exec(`INSERT INTO mano_carta VALUES ('${MANO}','AH',1)`);
    await expect(db.exec(`INSERT INTO mano_carta VALUES ('${MANO}','AH',2)`)).rejects.toThrow(/unique/i);
  });
});

describe("El saldo se deriva del libro de movimientos", () => {
  it("la vista saldo_jugador suma los movimientos", async () => {
    await db.exec(`INSERT INTO movimiento_ficha (jugador_id,monto,motivo) VALUES
      ('${J1}',1000,'BONO_BIENVENIDA'),('${J1}',-50,'APUESTA_RETENIDA'),('${J1}',150,'BOTE_GANADO')`);
    const { rows } = await db.query<{ saldo: string }>(
      `SELECT saldo FROM saldo_jugador WHERE jugador_id = '${J1}'`,
    );
    expect(Number(rows[0]?.saldo)).toBe(1100);
  });
});
