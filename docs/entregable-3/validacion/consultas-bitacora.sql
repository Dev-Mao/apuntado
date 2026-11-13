SELECT j.apodo,
       p.id AS partida_id,
       p.config_reglas ->> 'modalidad' AS modalidad,
       p.umbral_eliminacion AS umbral,
       p.estado,
       (SELECT count(*) FROM ronda r WHERE r.partida_id = p.id) AS rondas,
       coalesce(g.apodo, '(máquina o sin ganador)') AS ganador,
       p.iniciada_en,
       p.finalizada_en
FROM partida p
JOIN participacion pa ON pa.partida_id = p.id
JOIN jugador j ON j.id = pa.jugador_id
LEFT JOIN jugador g ON g.id = p.ganador_id
WHERE j.apodo IN ('U01', 'U02', 'U03', 'U04', 'U05')
ORDER BY j.apodo, p.iniciada_en;

WITH turnos AS (
    SELECT t.ronda_id, t.numero_turno, t.participacion_id, max(t.registrado_en) AS fin
    FROM turno_jugada t
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
SELECT j.apodo,
       count(*) AS turnos,
       round(avg(d.segundos) FILTER (WHERE d.segundos < d.limite)::numeric, 1) AS segundos_promedio,
       count(*) FILTER (WHERE d.segundos >= d.limite) AS turnos_vencidos
FROM duraciones d
JOIN participacion pa ON pa.id = d.participacion_id
JOIN jugador j ON j.id = pa.jugador_id
WHERE j.apodo IN ('U01', 'U02', 'U03', 'U04', 'U05')
GROUP BY j.apodo
ORDER BY j.apodo;

SELECT j.apodo, r.tipo_cierre, count(*) AS cierres
FROM ronda r
JOIN participacion pa ON pa.id = r.ganador_participacion_id
JOIN jugador j ON j.id = pa.jugador_id
WHERE j.apodo IN ('U01', 'U02', 'U03', 'U04', 'U05')
GROUP BY j.apodo, r.tipo_cierre
ORDER BY j.apodo;

SELECT r.numero AS ronda,
       t.numero_turno AS turno,
       t.secuencia,
       coalesce(j.apodo, pa.apodo_invitado) AS jugador,
       t.accion,
       t.carta_codigo AS carta,
       t.registrado_en
FROM turno_jugada t
JOIN ronda r ON r.id = t.ronda_id
JOIN participacion pa ON pa.id = t.participacion_id
LEFT JOIN jugador j ON j.id = pa.jugador_id
WHERE r.partida_id = '00000000-0000-0000-0000-000000000000'
ORDER BY r.numero, t.numero_turno, t.secuencia;
