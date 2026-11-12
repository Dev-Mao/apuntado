INSERT INTO valor_carta (valor, puntos, orden) VALUES
  ('A', 1, 1), ('2', 2, 2), ('3', 3, 3), ('4', 4, 4), ('5', 5, 5), ('6', 6, 6), ('7', 7, 7),
  ('8', 8, 8), ('9', 9, 9), ('10', 10, 10), ('J', 10, 11), ('Q', 10, 12), ('K', 10, 13);

INSERT INTO carta (codigo, valor, palo)
SELECT rtrim(v.valor) || p.palo, v.valor, p.palo
FROM valor_carta v
CROSS JOIN (VALUES ('H'), ('D'), ('C'), ('S')) AS p (palo);
