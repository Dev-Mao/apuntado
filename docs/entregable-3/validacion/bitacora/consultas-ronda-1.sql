-- Consultas para completar la sección 3 del Entregable 3.
-- Los participantes jugaron como invitados: su apodo está en participacion.apodo_invitado.
-- Las horas salen en hora de Colombia para separar a los tres que usaron el apodo U03
-- (19 de noviembre = U02, 20 de noviembre = U03, 21 de noviembre = U04).
-- Exportar cada resultado como CSV.

-- 1. Partidas de cada participante: modalidad, rondas y cierres válidos que logró.
WITH participante AS (
    SELECT pa.id AS participacion_id,
           pa.partida_id,
           coalesce(j.apodo, pa.apodo_invitado) AS apodo
    FROM participacion pa
    LEFT JOIN jugador j ON j.id = pa.jugador_id
)
SELECT u.apodo,
       to_char(p.iniciada_en AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI') AS inicio,
       p.id AS partida_id,
       p.config_reglas ->> 'modalidad' AS modalidad,
       p.estado,
       (SELECT count(*) FROM ronda r WHERE r.partida_id = p.id) AS rondas,
       (SELECT count(*) FROM ronda r WHERE r.ganador_participacion_id = u.participacion_id) AS cierres_validos,
       (SELECT string_agg(DISTINCT r.tipo_cierre::text, ', ') FROM ronda r WHERE r.ganador_participacion_id = u.participacion_id) AS tipos_de_cierre
FROM participante u
JOIN partida p ON p.id = u.partida_id
WHERE u.apodo IN ('U01', 'U02', 'U03', 'U04', 'U05')
  AND p.iniciada_en >= '2026-11-18 00:00-05'
ORDER BY p.iniciada_en;

-- 2. Tiempo promedio por turno de cada participante, separado por día.
WITH participante AS (
    SELECT pa.id AS participacion_id,
           coalesce(j.apodo, pa.apodo_invitado) AS apodo
    FROM participacion pa
    LEFT JOIN jugador j ON j.id = pa.jugador_id
),
turnos AS (
    SELECT t.ronda_id, t.numero_turno, t.participacion_id, max(t.registrado_en) AS fin
    FROM turno_jugada t
    GROUP BY t.ronda_id, t.numero_turno, t.participacion_id
),
duraciones AS (
    SELECT tu.participacion_id,
           tu.fin,
           extract(epoch FROM tu.fin - coalesce(lag(tu.fin) OVER (PARTITION BY tu.ronda_id ORDER BY tu.numero_turno), r.iniciada_en)) AS segundos,
           (p.config_reglas ->> 'segundosPorTurno')::int AS limite
    FROM turnos tu
    JOIN ronda r ON r.id = tu.ronda_id
    JOIN partida p ON p.id = r.partida_id
)
SELECT u.apodo,
       (d.fin AT TIME ZONE 'America/Bogota')::date AS dia,
       count(*) AS turnos,
       round(avg(d.segundos) FILTER (WHERE d.segundos < d.limite)::numeric, 1) AS segundos_promedio,
       count(*) FILTER (WHERE d.segundos >= d.limite) AS turnos_vencidos
FROM duraciones d
JOIN participante u ON u.participacion_id = d.participacion_id
WHERE u.apodo IN ('U01', 'U02', 'U03', 'U04', 'U05')
  AND d.fin >= '2026-11-18 00:00-05'
GROUP BY u.apodo, dia
ORDER BY dia, u.apodo;

-- 3. Log de auditoría de una partida, jugada por jugada.
--    Reemplazar el id por un partida_id de la consulta 1 (por ejemplo, la que ganó U03 el 20 de noviembre).
SELECT r.numero AS ronda,
       t.numero_turno AS turno,
       t.secuencia,
       coalesce(j.apodo, pa.apodo_invitado) AS jugador,
       t.accion,
       t.carta_codigo AS carta,
       to_char(t.registrado_en AT TIME ZONE 'America/Bogota', 'HH24:MI:SS') AS hora
FROM turno_jugada t
JOIN ronda r ON r.id = t.ronda_id
JOIN participacion pa ON pa.id = t.participacion_id
LEFT JOIN jugador j ON j.id = pa.jugador_id
WHERE r.partida_id = 'c86b2770-0107-43dd-9da8-09037dbb4408'
ORDER BY r.numero, t.numero_turno, t.secuencia;

-- 4. Todas las partidas cerca de las respuestas de U05 (18/11 00:12) y de U04 y U01 (21/11 16:59 y 18:14),
--    con cualquier apodo, para ubicar a quienes no aparecen en la consulta 1.
SELECT to_char(p.iniciada_en AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI') AS inicio,
       p.id AS partida_id,
       p.config_reglas ->> 'modalidad' AS modalidad,
       p.estado,
       string_agg(coalesce(j.apodo, pa.apodo_invitado), ', ') AS jugadores
FROM partida p
JOIN participacion pa ON pa.partida_id = p.id
LEFT JOIN jugador j ON j.id = pa.jugador_id
WHERE p.iniciada_en BETWEEN '2026-11-17 17:00-05' AND '2026-11-18 01:00-05'
   OR p.iniciada_en BETWEEN '2026-11-21 12:00-05' AND '2026-11-21 18:30-05'
GROUP BY p.id
ORDER BY p.iniciada_en;

-- 5. Partidas con el apodo U08 (17/11 en la noche y 18/11 antes de las 00:12), que por la hora serían de U05:
--    cierres válidos y tiempo por turno de cada partida.
WITH u AS (
    SELECT pa.id AS participacion_id, pa.partida_id
    FROM participacion pa
    JOIN partida p ON p.id = pa.partida_id
    LEFT JOIN jugador j ON j.id = pa.jugador_id
    WHERE coalesce(j.apodo, pa.apodo_invitado) = 'U08'
      AND p.iniciada_en BETWEEN '2026-11-17 17:00-05' AND '2026-11-18 00:12-05'
),
turnos AS (
    SELECT t.ronda_id, t.numero_turno, t.participacion_id, max(t.registrado_en) AS fin
    FROM turno_jugada t
    JOIN ronda r ON r.id = t.ronda_id
    WHERE r.partida_id IN (SELECT partida_id FROM u)
    GROUP BY t.ronda_id, t.numero_turno, t.participacion_id
),
duraciones AS (
    SELECT tu.participacion_id,
           extract(epoch FROM tu.fin - coalesce(lag(tu.fin) OVER (PARTITION BY tu.ronda_id ORDER BY tu.numero_turno), r.iniciada_en)) AS segundos,
           (p.config_reglas ->> 'segundosPorTurno')::int AS limite
    FROM turnos tu
    JOIN ronda r ON r.id = tu.ronda_id
    JOIN partida p ON p.id = r.partida_id
)
SELECT to_char(p.iniciada_en AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI') AS inicio,
       p.config_reglas ->> 'modalidad' AS modalidad,
       p.estado,
       (SELECT count(*) FROM ronda r WHERE r.partida_id = p.id) AS rondas,
       (SELECT count(*) FROM ronda r WHERE r.ganador_participacion_id = u.participacion_id) AS cierres_validos,
       (SELECT string_agg(DISTINCT r.tipo_cierre::text, ', ') FROM ronda r WHERE r.ganador_participacion_id = u.participacion_id) AS tipos_de_cierre,
       (SELECT count(*) FROM duraciones d WHERE d.participacion_id = u.participacion_id) AS turnos,
       (SELECT round(avg(d.segundos)::numeric, 1) FROM duraciones d WHERE d.participacion_id = u.participacion_id AND d.segundos < d.limite) AS segundos_promedio,
       (SELECT count(*) FROM duraciones d WHERE d.participacion_id = u.participacion_id AND d.segundos >= d.limite) AS turnos_vencidos
FROM u
JOIN partida p ON p.id = u.partida_id
ORDER BY p.iniciada_en;
