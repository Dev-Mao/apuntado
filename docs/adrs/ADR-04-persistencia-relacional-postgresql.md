# ADR-04 · Persistir en PostgreSQL con un esquema relacional normalizado

| Campo | Valor |
|---|---|
| **Estado** | Accepted |
| **Fecha** | 25 de octubre de 2026 |
| **Decisores** | Mariana Agudelo Ospina · Juan José Chaves Alvear · Joaquín Andrés Escalante |
| **Relacionado con** | ADR-01, ADR-05 |

---

## Contexto

El sistema debe registrar partidas, manos, la trazabilidad de robos y descartes, y el **marcador
acumulativo hasta 101 puntos**. La modalidad clásica es atómica —una ronda se resuelve sola—,
mientras que el apuntado es **acumulativo multironda**: el estado relevante no es una partida sino
la suma de sus rondas.

**Fuerzas en juego**

1. **Integridad del marcador.** Liquidar una ronda actualiza el acumulado de todos los jugadores y
   puede eliminar a varios. O se aplica completo o no se aplica.
2. **El libro de fichas es contable.** Retener una apuesta y descontar el saldo deben ocurrir juntos.
3. **Consultas agregadas.** El historial y las estadísticas son conteos y sumas por jugador.
4. **La partida en curso no se persiste** (trade-off T3 del Entregable 1): vive en memoria y solo
   se persisten los resultados y la bitácora.
5. El catálogo de puntos de variación **crece con cada regla nueva**.

**Alternativas evaluadas**

| | Opción | Valoración |
|---|---|---|
| A | **PostgreSQL, esquema relacional normalizado** | Transacciones ACID, restricciones declarativas, consultas agregadas naturales |
| B | MongoDB, documento agregado por partida | La mesa completa en un documento; consistencia garantizada solo dentro del documento |
| C | SQLite embebida | Cero operación, pero un solo escritor y sin despliegue en la nube |

---

## Decisión

**Se adopta PostgreSQL con un esquema relacional en 3FN (alternativa A)**, con una topología
**monolítica centralizada**: una sola base de datos para los cuatro módulos, con separación lógica
por tablas y no por instancias.

El esquema completo está en `models/er/schema.sql` y su modelo E-R en `models/er/modelo-er.puml`.
Tablas: `valor_carta`, `carta`, `jugador`, `partida`, `participacion`, `ronda`, `mano_jugador`,
`mano_carta`, `turno_jugada`, `puntaje_acumulado` y `movimiento_ficha`.

**Justificación**

1. **El umbral de 101 exige atomicidad.** Es el requisito más fuerte: liquidar una ronda escribe
   el puntaje de todos los participantes y marca eliminaciones. En A es una transacción; en B
   serían varias actualizaciones de documento sin garantía conjunta.
2. **Las restricciones son declarativas.** `UNIQUE (participacion_id, ronda_id)` impide liquidar
   dos veces la misma ronda **en la base de datos**, no en el código. Esa invariante no depende de
   que el programador se acuerde.
3. **La normalización refleja el dominio.** Una partida tiene rondas, una ronda tiene manos, una
   mano tiene cartas. Es una jerarquía de identidades, no un agregado que se lea siempre completo.
4. **Las consultas son agregadas.** «Cuántas partidas ganó» y «cuántos cierres por apuntado» son
   `COUNT` y `GROUP BY`.

**Sobre la normalización.** El esquema está en 3FN. Dos decisiones lo sostienen:
- `valor_carta` se separa de `carta` para eliminar la dependencia transitiva
  `codigo → valor → puntos`.
- `mano_carta` es una tabla puente en lugar de un arreglo de cartas, lo que preserva la 1FN.

**Única desnormalización deliberada:** `partida.config_reglas` se almacena como **JSONB**.
Normalizar el catálogo de puntos de variación exigiría una migración de esquema por cada regla
nueva, justo lo contrario de lo que promete el ADR-03. El campo se escribe una vez al crear la
partida y solo se lee; no participa en ninguna consulta agregada.

---

## Consecuencias

**Positivas**
- La integridad del marcador queda garantizada por el motor, no por el código de aplicación.
- El historial es interpretable: cada partida conserva las reglas con que se jugó (RN-04).
- El saldo de fichas nunca se almacena: se deriva del libro de movimientos y es auditable.
- El esquema documenta el dominio; las restricciones son ejecutables.

**Negativas (trade-offs aceptados)**
- **Más tablas que un documento agregado.** Reconstruir el estado completo de una ronda exige
  varios `JOIN`. Se acepta porque la partida en curso no se lee de la base de datos: vive en memoria.
- **Migraciones de esquema.** Todo cambio estructural requiere una migración versionada. Mitigado
  concentrando la variabilidad esperada en `config_reglas`.
- **El impedance mismatch entre dominio y entidades** obliga a mantener traductores
  (`GameMapper`, `HandMapper`). Es el precio de que el dominio no conozca la persistencia.
- **`turno_jugada` crece rápido**: unas 40 filas por ronda. Requiere política de archivado si el
  sistema viviera años; fuera del alcance del MVP.

---

## Cumplimiento (Compliance)

| # | Verificación | Tipo |
|---|---|---|
| FF-02 | El dominio no importa clases de persistencia ni librerías externas | Automatizada · TSArch + dependency-cruiser |
| C-03 | El esquema aplica sin errores sobre una base limpia y las restricciones rechazan los casos inválidos | Automatizada · prueba de integración sobre PostgreSQL efímero |
| C-04 | Liquidar dos veces la misma ronda viola `UNIQUE (participacion_id, ronda_id)` y falla | Automatizada · prueba de integración |
| C-05 | Revisión de que ninguna tabla nueva introduzca dependencias transitivas (3FN) | Manual · revisión de cada migración |

---

## Notas

- **Autor:** Joaquín Andrés Escalante (Arquitecto de Aplicaciones y Datos)
- **Revisores:** Mariana Agudelo Ospina, Juan José Chaves Alvear
- **Referencias:** Richards y Ford (2025), caps. 10, 11, 14 y 26 *Architectural Intersections —
  Architecture and Data Topologies*.
