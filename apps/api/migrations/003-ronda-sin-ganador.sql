ALTER TABLE ronda DROP CONSTRAINT cierre_coherente;

ALTER TABLE ronda ADD CONSTRAINT cierre_coherente CHECK (
    (cerrada_en IS NULL AND tipo_cierre IS NULL AND ganador_participacion_id IS NULL)
    OR (cerrada_en IS NOT NULL AND (tipo_cierre IS NULL) = (ganador_participacion_id IS NULL))
);
