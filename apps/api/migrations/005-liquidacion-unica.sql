CREATE UNIQUE INDEX retencion_unica ON movimiento_ficha (partida_id, jugador_id)
    WHERE motivo = 'APUESTA_RETENIDA';

CREATE UNIQUE INDEX liquidacion_unica ON movimiento_ficha (partida_id, jugador_id)
    WHERE motivo IN ('BOTE_GANADO', 'APUESTA_DEVUELTA');
