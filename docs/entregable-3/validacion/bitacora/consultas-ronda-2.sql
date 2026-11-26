-- Consultas de la ronda 2 de la validación (versión actual del juego).
-- Participantes: U06, U07 y U08, como invitados: su apodo está en participacion.apodo_invitado.
-- Todas filtran desde el 25 de noviembre: en la ronda 1 alguien jugó con el apodo U08 el 17 y 18 de noviembre,
-- y esas partidas no deben mezclarse con las de la ronda 2.
-- Horas en hora de Colombia. Exportar cada resultado como CSV.

-- 1. Partidas de cada participante: modalidad, rondas, cierres válidos y tipo de cierre.
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
WHERE u.apodo IN ('U06', 'U07', 'U08')
  AND p.iniciada_en >= '2026-11-25 00:00-05'
ORDER BY p.iniciada_en;

-- 2. Tiempo promedio por turno de cada participante (sin contar los turnos vencidos) y turnos vencidos.
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
       count(*) AS turnos,
       round(avg(d.segundos) FILTER (WHERE d.segundos < d.limite)::numeric, 1) AS segundos_promedio,
       count(*) FILTER (WHERE d.segundos >= d.limite) AS turnos_vencidos
FROM duraciones d
JOIN participante u ON u.participacion_id = d.participacion_id
WHERE u.apodo IN ('U06', 'U07', 'U08')
  AND d.fin >= '2026-11-25 00:00-05'
GROUP BY u.apodo
ORDER BY u.apodo;

-- 3. Control: todas las partidas desde el 25 de noviembre, con cualquier apodo.
--    Sirve para encontrar a un participante que haya escrito mal su código al entrar.
SELECT to_char(p.iniciada_en AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI') AS inicio,
       p.id AS partida_id,
       p.config_reglas ->> 'modalidad' AS modalidad,
       p.estado,
       string_agg(coalesce(j.apodo, pa.apodo_invitado), ', ') AS jugadores
FROM partida p
JOIN participacion pa ON pa.partida_id = p.id
LEFT JOIN jugador j ON j.id = pa.jugador_id
WHERE p.iniciada_en >= '2026-11-25 00:00-05'
GROUP BY p.id
ORDER BY p.iniciada_en;

-- 4. Log de auditoría de una partida, jugada por jugada.
--    Reemplazar el id por un partida_id de la consulta 1.
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
WHERE r.partida_id = '00000000-0000-0000-0000-000000000000'
ORDER BY r.numero, t.numero_turno, t.secuencia;
