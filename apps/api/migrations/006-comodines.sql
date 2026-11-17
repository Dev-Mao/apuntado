ALTER TABLE valor_carta
    DROP CONSTRAINT valor_carta_puntos_check,
    DROP CONSTRAINT valor_carta_orden_check,
    ADD CONSTRAINT valor_carta_puntos_check CHECK (puntos BETWEEN 1 AND 25),
    ADD CONSTRAINT valor_carta_orden_check CHECK (orden BETWEEN 1 AND 14);

INSERT INTO valor_carta (valor, puntos, orden) VALUES ('X', 25, 14);

INSERT INTO carta (codigo, valor, palo) VALUES ('XH', 'X', 'H'), ('XS', 'X', 'S');
