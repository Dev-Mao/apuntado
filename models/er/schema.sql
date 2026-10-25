-- Esquema relacional — Apuntado (PostgreSQL 16, 3FN)
-- Entregable 2 · §2.2 — corresponde 1 a 1 con models/er/modelo-er.puml

CREATE TYPE player_kind      AS ENUM ('REGISTRADO', 'INVITADO');
CREATE TYPE game_mode        AS ENUM ('VS_MAQUINA', 'SALA_PRIVADA');
CREATE TYPE game_status      AS ENUM ('EN_SALA', 'EN_CURSO', 'FINALIZADA');
CREATE TYPE closure_type     AS ENUM ('CLASICO', 'APUNTADO');
CREATE TYPE play_action      AS ENUM ('ROBAR_MAZO', 'ROBAR_POZO', 'DESCARTAR', 'DECLARAR_CIERRE');
CREATE TYPE movement_reason  AS ENUM ('BONO_BIENVENIDA', 'APUESTA_RETENIDA', 'BOTE_GANADO', 'RECARGA');

-- ---------------------------------------------------------------- catálogos
-- Separar valor_carta de carta elimina la dependencia transitiva
-- codigo -> valor -> puntos, que violaría la 3FN.
CREATE TABLE valor_carta (
    valor   CHAR(2)  PRIMARY KEY,
    puntos  SMALLINT NOT NULL CHECK (puntos BETWEEN 1 AND 10),
    orden   SMALLINT NOT NULL UNIQUE CHECK (orden BETWEEN 1 AND 13)
);

CREATE TABLE carta (
    codigo CHAR(3) PRIMARY KEY,
    valor  CHAR(2) NOT NULL REFERENCES valor_carta (valor),
    palo   CHAR(1) NOT NULL CHECK (palo IN ('H', 'D', 'C', 'S')),
    UNIQUE (valor, palo)
);

-- ---------------------------------------------------------------- identidad
CREATE TABLE jugador (
    id               UUID PRIMARY KEY,
    correo           VARCHAR(255) UNIQUE,
    hash_contrasena  TEXT,
    apodo            VARCHAR(40) NOT NULL,
    tipo             player_kind NOT NULL,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Un invitado no tiene credenciales; un registrado siempre las tiene.
    CONSTRAINT credenciales_coherentes CHECK (
        (tipo = 'REGISTRADO' AND correo IS NOT NULL AND hash_contrasena IS NOT NULL)
        OR (tipo = 'INVITADO' AND correo IS NULL AND hash_contrasena IS NULL)
    )
);

-- ---------------------------------------------------------------- partida
CREATE TABLE partida (
    id                  UUID PRIMARY KEY,
    modo                game_mode   NOT NULL,
    estado              game_status NOT NULL,
    umbral_eliminacion  SMALLINT    NOT NULL DEFAULT 101 CHECK (umbral_eliminacion > 0),
    -- Desnormalización deliberada: el catálogo de puntos de variación crece con
    -- cada regla nueva y normalizarlo exigiría una migración por regla (ADR-03).
    config_reglas       JSONB       NOT NULL,
    monto_apuesta       INTEGER     NOT NULL DEFAULT 0 CHECK (monto_apuesta >= 0),
    -- Bloqueo optimista: protege la liquidación de la ronda (ADR-04, §2.4).
    version             INTEGER     NOT NULL DEFAULT 0,
    iniciada_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizada_en       TIMESTAMPTZ,
    ganador_id          UUID REFERENCES jugador (id),
    CONSTRAINT fin_coherente CHECK (
        (estado = 'FINALIZADA' AND finalizada_en IS NOT NULL)
        OR (estado <> 'FINALIZADA' AND finalizada_en IS NULL)
    )
);

CREATE TABLE participacion (
    id                  UUID PRIMARY KEY,
    partida_id          UUID     NOT NULL REFERENCES partida (id) ON DELETE CASCADE,
    jugador_id          UUID     REFERENCES jugador (id),
    apodo_invitado      VARCHAR(40),
    posicion            SMALLINT NOT NULL CHECK (posicion BETWEEN 1 AND 4),
    eliminado_en_ronda  SMALLINT,
    UNIQUE (partida_id, posicion),
    UNIQUE (partida_id, jugador_id)
);

CREATE TABLE ronda (
    id                       UUID     PRIMARY KEY,
    partida_id               UUID     NOT NULL REFERENCES partida (id) ON DELETE CASCADE,
    numero                   SMALLINT NOT NULL CHECK (numero > 0),
    tipo_cierre              closure_type,
    ganador_participacion_id UUID     REFERENCES participacion (id),
    iniciada_en              TIMESTAMPTZ NOT NULL DEFAULT now(),
    cerrada_en               TIMESTAMPTZ,
    UNIQUE (partida_id, numero),
    CONSTRAINT cierre_coherente CHECK (
        (cerrada_en IS NULL AND tipo_cierre IS NULL AND ganador_participacion_id IS NULL)
        OR (cerrada_en IS NOT NULL AND tipo_cierre IS NOT NULL)
    )
);

-- ---------------------------------------------------------------- manos
CREATE TABLE mano_jugador (
    id               UUID PRIMARY KEY,
    ronda_id         UUID NOT NULL REFERENCES ronda (id) ON DELETE CASCADE,
    participacion_id UUID NOT NULL REFERENCES participacion (id),
    UNIQUE (ronda_id, participacion_id)
);

-- Tabla puente: mantiene la 1FN en vez de guardar un arreglo de cartas.
CREATE TABLE mano_carta (
    mano_id       UUID     NOT NULL REFERENCES mano_jugador (id) ON DELETE CASCADE,
    carta_codigo  CHAR(3)  NOT NULL REFERENCES carta (codigo),
    posicion      SMALLINT NOT NULL,
    PRIMARY KEY (mano_id, carta_codigo),
    -- Una sola baraja: la misma carta no puede estar dos veces en la misma ronda.
    UNIQUE (mano_id, posicion)
);

-- ---------------------------------------------------------------- bitácora
-- Se escribe de forma ASÍNCRONA, fuera del camino crítico del turno (ADR-05).
-- Su pérdida degrada la trazabilidad, nunca el estado del juego.
CREATE TABLE turno_jugada (
    id                BIGSERIAL PRIMARY KEY,
    ronda_id          UUID        NOT NULL REFERENCES ronda (id) ON DELETE CASCADE,
    participacion_id  UUID        NOT NULL REFERENCES participacion (id),
    numero_turno      SMALLINT    NOT NULL CHECK (numero_turno > 0),
    secuencia         SMALLINT    NOT NULL,
    accion            play_action NOT NULL,
    carta_codigo      CHAR(3)     REFERENCES carta (codigo),
    registrado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ronda_id, numero_turno, secuencia)
);

-- ---------------------------------------------------------------- puntaje
CREATE TABLE puntaje_acumulado (
    id                 UUID     PRIMARY KEY,
    participacion_id   UUID     NOT NULL REFERENCES participacion (id) ON DELETE CASCADE,
    ronda_id           UUID     NOT NULL REFERENCES ronda (id) ON DELETE CASCADE,
    puntos_ronda       SMALLINT NOT NULL CHECK (puntos_ronda >= 0),
    puntos_acumulados  SMALLINT NOT NULL CHECK (puntos_acumulados >= 0),
    -- Idempotencia: impide liquidar dos veces la misma ronda para el mismo jugador.
    UNIQUE (participacion_id, ronda_id)
);

-- ---------------------------------------------------------------- economía
CREATE TABLE movimiento_ficha (
    id          BIGSERIAL PRIMARY KEY,
    jugador_id  UUID            NOT NULL REFERENCES jugador (id),
    monto       INTEGER         NOT NULL,
    motivo      movement_reason NOT NULL,
    partida_id  UUID            REFERENCES partida (id),
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- índices
CREATE INDEX idx_participacion_jugador ON participacion (jugador_id);
CREATE INDEX idx_ronda_partida         ON ronda (partida_id, numero);
CREATE INDEX idx_jugada_ronda          ON turno_jugada (ronda_id, numero_turno);
CREATE INDEX idx_puntaje_participacion ON puntaje_acumulado (participacion_id);
CREATE INDEX idx_movimiento_jugador    ON movimiento_ficha (jugador_id, creado_en DESC);

-- ---------------------------------------------------------------- vistas
-- El saldo nunca se almacena: se deriva del libro de movimientos.
CREATE VIEW saldo_jugador AS
SELECT jugador_id, COALESCE(SUM(monto), 0) AS saldo
FROM movimiento_ficha
GROUP BY jugador_id;

-- Marcador vigente de una partida, derivado de la última ronda liquidada.
CREATE VIEW marcador_partida AS
SELECT DISTINCT ON (pa.participacion_id)
       p.partida_id, pa.participacion_id, pa.puntos_acumulados, r.numero AS ultima_ronda
FROM puntaje_acumulado pa
JOIN ronda r         ON r.id = pa.ronda_id
JOIN participacion p ON p.id = pa.participacion_id
ORDER BY pa.participacion_id, r.numero DESC;
