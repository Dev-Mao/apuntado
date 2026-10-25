# Entregable 2 — Sección 2: Arquitectura de Información y Topología de Datos
**Peso en la rúbrica: 25%**

Las notas entre corchetes `[así]` son indicaciones para el equipo y **no van en el PDF**.

## 2.1 Justificación de la Topología de Base de Datos

Se adopta **PostgreSQL con topología monolítica centralizada**: una sola base de datos para los
cuatro módulos, con separación lógica por tablas y no por instancias. Formalizado en el **ADR-04**.

| Topología | Consistencia | Simplicidad | Valoración |
|---|---|---|---|
| **Monolítica centralizada (PostgreSQL)** | Transacciones ACID entre todos los módulos | Un solo motor que operar | **Adoptada** |
| Embebida (SQLite) | ACID, pero un solo escritor | Máxima: sin servidor | Descartada: el servidor es multiusuario y necesita despliegue en la nube |
| Documental (MongoDB) | Garantizada dentro de un documento | Alta para agregados | Descartada: ver §2.2 |
| Una base por módulo | Sin transacciones entre módulos | Baja: cuatro motores | Descartada: innecesaria con un solo quantum |

**El trade-off decisivo es consistencia contra simplicidad, y aquí no están en conflicto.** El
sistema tiene **un solo quantum arquitectónico** (ADR-03): un desplegable con una base de datos.
Separar la base por módulo introduciría consistencia eventual entre Juego y Economía sin ninguna
ganancia, porque no hay equipos ni despliegues independientes que lo justifiquen.

**Lo que no se persiste.** La partida en curso **no vive en la base de datos**: reside en memoria
del servidor (trade-off T3 del Entregable 1). La base guarda resultados, bitácora y catálogos. Esa
frontera es lo que permite sostener el presupuesto de 100 ms por validación.

## 2.2 Especificación del Esquema de Datos — Opción A: Relacional (E-R)

### Por qué relacional y no documental

| Criterio | Relacional | Documental |
|---|---|---|
| **Atomicidad del marcador a 101** | Una transacción cubre todos los jugadores | Varias actualizaciones de documento sin garantía conjunta |
| **Libro de fichas** | Retener y descontar ocurren juntos o no ocurren | Requiere transacciones multidocumento |
| **Estadísticas e historial** | `COUNT` y `GROUP BY` nativos | Pipelines de agregación más costosos |
| **Invariantes** | Declarativas: `UNIQUE`, `CHECK`, `FK` | En el código de aplicación |
| **Lectura del estado completo de una partida** | Varios `JOIN` | Una sola lectura |

El último criterio es el único donde el documental gana, y **no aplica**: la partida en curso no
se lee de la base de datos. La decisión se apoya entonces en el requisito más fuerte, la
atomicidad del marcador acumulativo.

{{IMG:modelo-er}}

### Diccionario de entidades

| Entidad | Propósito | Claves |
|---|---|---|
| `valor_carta` | Catálogo de valores con sus puntos y orden | PK `valor` |
| `carta` | Catálogo de las 52 cartas | PK `codigo`, FK `valor` |
| `jugador` | Cuenta registrada o sesión de invitado | PK `id`, `correo` único |
| `partida` | Sesión de juego con su configuración de reglas | PK `id`, FK `ganador_id` |
| `participacion` | Un jugador en una partida, con su posición en la mesa | PK `id`, únicos `(partida_id, posicion)` |
| `ronda` | Una ronda dentro de la partida | PK `id`, único `(partida_id, numero)` |
| `mano_jugador` | La mano de un participante en una ronda | PK `id`, único `(ronda_id, participacion_id)` |
| `mano_carta` | Tabla puente mano–carta | PK compuesta `(mano_id, carta_codigo)` |
| `turno_jugada` | **Bitácora**: robos, descartes y cierres | PK `id`, único `(ronda_id, numero_turno, secuencia)` |
| `puntaje_acumulado` | Puntos de la ronda y acumulado del participante | PK `id`, único `(participacion_id, ronda_id)` |
| `movimiento_ficha` | Libro de movimientos de fichas, solo inserción | PK `id`, FK `jugador_id` |

**La relación 1:N entre `partida` y `ronda` es la que soporta la modalidad Apuntado**: se juegan
tantas rondas como haga falta hasta que alguien alcance el umbral, y `puntaje_acumulado` conserva
el acumulado tras cada una. La modalidad clásica usa la misma estructura con una sola ronda.

### Normalización (3FN)

| Forma | Cómo se cumple |
|---|---|
| **1FN** | Ningún atributo multivaluado. Las cartas de una mano se almacenan en `mano_carta`, no como arreglo |
| **2FN** | Todas las claves primarias son simples salvo `mano_carta`, cuyo único atributo (`posicion`) depende de la clave completa |
| **3FN** | `valor_carta` se separa de `carta` para eliminar la dependencia transitiva `codigo → valor → puntos` |

**Desnormalización deliberada y única:** `partida.config_reglas` se almacena como **JSONB**.
Normalizar el catálogo de puntos de variación exigiría una migración de esquema por cada regla
nueva, justo lo contrario de lo que promete el ADR-03. El campo se escribe al crear la partida,
solo se lee, y no participa en ninguna consulta agregada.

**Dos atributos que a propósito no existen:**
- No hay columna `saldo` en `jugador`: el saldo se deriva del libro de movimientos (vista
  `saldo_jugador`). Un saldo almacenado puede quedar inconsistente con sus movimientos.
- No hay columna `puntos` en `carta`: depende del valor, no de la carta, y almacenarla rompería la 3FN.

> [El esquema ejecutable completo, con todas las restricciones, índices y vistas, está en
> `models/er/schema.sql`. Si falta espacio en el PDF, basta con referenciarlo.]

## 2.3 Diagrama UML de Clases de Entidad y Mapeo

{{IMG:clases-persistencia}}

| Clase de entidad | Tabla | Clase de dominio asociada |
|---|---|---|
| `PlayerEntity` | `jugador` | `Jugador` |
| `GameSessionEntity` | `partida` | `Partida` (raíz del agregado) |
| `ParticipationEntity` | `participacion` | `Jugador` dentro de una `Partida` |
| `RoundEntity` | `ronda` | `Ronda` |
| `HandStateEntity` | `mano_jugador` + `mano_carta` | `Mano` |
| `PlayLogEntity` | `turno_jugada` | — (solo auditoría, sin equivalente en el dominio) |
| `RoundScoreEntity` | `puntaje_acumulado` | Resultado de `LiquidadorDeRonda` |
| `ChipMovementEntity` | `movimiento_ficha` | `ChipMovement` |

**El dominio y la persistencia son dos modelos distintos, unidos por traductores.** `GameMapper` y
`HandMapper` son el único punto del sistema que conoce ambas formas. El dominio nunca importa una
clase de persistencia, lo que verifica la fitness function FF-02.

Dos diferencias deliberadas entre ambos modelos:
- `HandStateEntity` expone `cartas` como arreglo, pero **se almacena normalizado** en `mano_carta`.
  El arreglo es la vista de la entidad, no la estructura de la tabla.
- `PlayLogEntity` **no tiene equivalente en el dominio**: la bitácora es un artefacto de auditoría.
  El dominio no sabe que existe; escribe en ella a través del puerto `BitacoraDeJugadas`.

## 2.4 Estrategia de Transaccionalidad y Consistencia

El momento crítico es el **cierre de ronda**: hay que asignar cero puntos al ganador, calcular el
residuo de cada perdedor, acumular, marcar eliminados y decidir si la partida terminó. Se protege
en cuatro capas, de la más externa a la más interna.

**1. La mesa es la unidad de concurrencia (en memoria).** Cada partida procesa sus intenciones
**en serie**. Si dos jugadores declaran cierre en el mismo instante, uno se procesa y el otro se
rechaza con «no es su turno». La exclusión mutua ocurre antes de llegar a la base de datos.

**2. Una sola transacción por liquidación.** Todo el cierre ocurre dentro de una transacción con
nivel de aislamiento `READ COMMITTED`:

```sql
BEGIN;
  UPDATE partida SET version = version + 1
   WHERE id = :partida AND version = :version_leida;   -- bloqueo optimista
  -- si afecta 0 filas: otro proceso liquidó primero -> ROLLBACK y reintento

  UPDATE ronda SET cerrada_en = now(), tipo_cierre = :tipo,
                   ganador_participacion_id = :ganador
   WHERE id = :ronda AND cerrada_en IS NULL;

  INSERT INTO puntaje_acumulado (id, participacion_id, ronda_id,
                                 puntos_ronda, puntos_acumulados)
  VALUES ...;                                           -- una fila por participante

  UPDATE participacion SET eliminado_en_ronda = :numero
   WHERE id = ANY(:eliminados);

  UPDATE partida SET estado = 'FINALIZADA', finalizada_en = now(), ganador_id = :ganador
   WHERE id = :partida AND :queda_un_jugador;
COMMIT;
```

O se aplica el cierre completo, o no se aplica nada. **Nunca hay penalizaciones parciales.**

**3. Idempotencia declarativa.** La restricción `UNIQUE (participacion_id, ronda_id)` de
`puntaje_acumulado` hace que liquidar dos veces la misma ronda **falle en el motor**, no en el
código. Un reintento tras un corte de red no duplica puntos. En el mismo sentido, la condición
`cerrada_en IS NULL` impide cerrar una ronda ya cerrada.

**4. Bloqueo optimista con `partida.version`.** Si dos procesos intentaran liquidar la misma
partida, solo uno incrementa la versión; el otro no afecta ninguna fila y aborta. Se prefiere
optimista a pesimista porque el conflicto es **raro** —lo normal es que la mesa esté serializada
por la capa 1— y el bloqueo pesimista costaría latencia en todas las liquidaciones para proteger
un caso excepcional.

### Lo que queda fuera de la transacción, a propósito

| Operación | Dónde ocurre | Por qué |
|---|---|---|
| Escritura en `turno_jugada` | Asíncrona, fuera de la transacción | Es auditoría; su pérdida degrada la trazabilidad, nunca el estado del juego |
| Acreditación del bote | Evento `PartidaFinalizada`, tras el commit | Economía no debe participar de la transacción del juego |
| Archivado en Historial | Evento `PartidaFinalizada`, tras el commit | Ídem |

**La consecuencia aceptada:** entre el commit del cierre y la acreditación del bote hay una
ventana de consistencia eventual. Es aceptable porque los movimientos de fichas son reconstruibles
a partir del resultado persistido de la partida, que ya está confirmado en ese punto.

> [Nota para la sustentación: la pregunta previsible es «¿y si el servidor cae justo después del
> COMMIT y antes de acreditar el bote?». La respuesta es que el resultado ya está persistido y la
> acreditación puede reproducirse desde él; por eso el libro de fichas es un registro derivado y
> append-only, y no un saldo que se sobrescribe.]
