# Entregable 2. Sección 4: Análisis de riesgo arquitectónico y Risk Storming
**Peso en la rúbrica: 20%**

## 4.1 Matriz de riesgo 3×3

Siguiendo a Richards y Ford (2025, cap. 22), el riesgo se calcula como **impacto × probabilidad**,
ambos en escala 1 (bajo) a 3 (alto), lo que produce puntuaciones de 1 a 9. La matriz siguiente
ubica en su celda cada uno de los diez riesgos identificados en la sesión de Risk Storming; su
identificación y valoración se detallan en §4.2.

| | **Probabilidad 1 (baja)** | **Probabilidad 2 (media)** | **Probabilidad 3 (alta)** |
|---|---|---|---|
| **Impacto 3 (alto)** | 3 · Medio<br>— | **6 · Alto**<br>R-01, R-02, R-03 | **9 · Alto**<br>— |
| **Impacto 2 (medio)** | 2 · Bajo<br>— | 4 · Medio<br>R-05, R-06, R-07 | **6 · Alto**<br>R-04, R-09 |
| **Impacto 1 (bajo)** | 1 · Bajo<br>R-10 | 2 · Bajo<br>R-08 | 3 · Medio<br>— |

Leyenda: R-01 evaluador de mano · R-02 estado en memoria · R-03 acumulación a 101 ·
R-04 erosión del orquestador · R-05 reglas ambiguas · R-06 sincronización de clientes ·
R-07 abandono de turno · R-08 bitácora incompleta · R-09 alcance del MVP · R-10 renderizado de cartas.

Cinco riesgos caen en zona roja y ninguno alcanza la celda de 9, lo que indica que las
valoraciones no se inflaron para dar apariencia de rigor.

| Puntuación | Clasificación | Acción requerida |
|---|---|---|
| 1 a 2 | Bajo (verde) | Se acepta y se documenta |
| 3 a 4 | Medio (amarillo) | Se vigila; mitigación si el costo es bajo |
| 6 a 9 | **Alto (rojo)** | **Exige un cambio arquitectónico concreto** |

La puntuación 6 se alcanza por dos caminos distintos: impacto alto con probabilidad media,
o impacto medio con probabilidad alta. **No se mitigan igual**. En
el primer caso se reduce el impacto; en el segundo, la probabilidad. Esa distinción guía el plan
de mitigación de §4.3.

## 4.2 Reporte de la sesión de Risk Storming

**Participantes:** Mariana Agudelo Ospina (Arquitecta Tecnológica / Solución), Juan José Chaves
Alvear (Arquitecto de Negocio) y Joaquín Andrés Escalante (Arquitecto de Aplicaciones y Datos).
**Artefacto analizado:** diagrama UML de componentes detallado (§1.3) y modelo E-R (§2.2).

### Fase 1 · Identificación individual

Cada integrante analizó el diagrama **en silencio y por separado**, anotando riesgos sobre los
componentes sin discutirlos. Se identificaron diez riesgos, varios de ellos señalados por más de
una persona de forma independiente:

| ID | Riesgo | Componente afectado |
|---|---|---|
| R-01 | Error en el algoritmo combinatorio de validación de manos | `EvaluadorDeMano` |
| R-02 | Pérdida del estado de las partidas al reiniciar el servidor | `PartidasEnMemoria` |
| R-03 | Inconsistencia en la acumulación hacia los 101 puntos | `LiquidadorDeRonda`, `puntaje_acumulado` |
| R-04 | El orquestador absorbe lógica que pertenece a las reglas | `OrquestadorDeTurnos` |
| R-05 | Ambigüedad en las reglas del dominio no escritas | Reglas de juego |
| R-06 | Latencia o desincronización entre los clientes de una mesa | `EmisorWebSocket` |
| R-07 | Turnos abandonados que bloquean la mesa | `VigilanteDeTurno` |
| R-08 | Bitácora de jugadas incompleta ante una caída | `BitacoraAsincrona` |
| R-09 | Alcance del MVP superior al tiempo disponible | Proyecto |
| R-10 | Inconsistencias visuales en el renderizado de cartas | Cliente Web |

### Fase 2 · Consenso

Al consolidar las valoraciones individuales aparecieron **tres discrepancias** que exigieron
discusión. Se documentan porque el criterio con que se resolvieron es, en sí mismo, parte del
análisis:

| Riesgo | Discrepancia | Resolución y criterio |
|---|---|---|
| **R-02** | Dos integrantes valoraron el impacto en 3 (perder una partida en curso) y uno en 2, argumentando que una partida social de quince minutos se rehace | Se acordó **impacto 3**: perder la partida de todos los jugadores de la mesa, y no solo la propia, destruye la confianza en la plataforma |
| **R-04** | Las probabilidades propuestas fueron 1, 2 y 3 | Se acordó **probabilidad 3**: la retroalimentación del Entregable 1 advirtió expresamente de este riesgo, y es un deterioro gradual que nadie decide conscientemente |
| **R-09** | Impacto valorado entre 2 y 3 | Se acordó **impacto 2**: un MVP recortado sigue siendo entregable; lo que está en juego es el alcance, no la viabilidad |

### Riesgos consolidados

| ID | Área / Componente evaluado | Impacto | Probabilidad | Total | Clasificación y criterio |
|---|---|---|---|---|---|
| R-01 | `EvaluadorDeMano` (algoritmo 4-3-3) | 3 (Alto) | 2 (Med) | **6** | **Alto**: falla combinatoria silenciosa |
| R-02 | `PartidasEnMemoria` (estado volátil) | 3 (Alto) | 2 (Med) | **6** | **Alto**: pérdida de partidas en curso |
| R-03 | `puntaje_acumulado` (umbral 101) | 3 (Alto) | 2 (Med) | **6** | **Alto**: inconsistencia en la acumulación |
| R-04 | `OrquestadorDeTurnos` (erosión estructural) | 2 (Med) | 3 (Alta) | **6** | **Alto**: degradación gradual del diseño |
| R-05 | Reglas de dominio ambiguas | 2 (Med) | 2 (Med) | 4 | Medio: retrabajo acotado |
| R-06 | `EmisorWebSocket` (sincronización) | 2 (Med) | 2 (Med) | 4 | Medio: degrada la experiencia |
| R-07 | `VigilanteDeTurno` (abandono de turno) | 2 (Med) | 2 (Med) | 4 | Medio: mesa bloqueada |
| R-09 | Alcance del MVP frente al calendario | 2 (Med) | 3 (Alta) | **6** | **Alto**: riesgo de proyecto |
| R-08 | `BitacoraAsincrona` (pérdida de entradas) | 1 (Bajo) | 2 (Med) | 2 | Bajo: degrada auditoría, no el juego |
| R-10 | Renderizado de cartas | 1 (Bajo) | 1 (Baja) | 1 | Bajo: estilo visual |

Quedan cinco riesgos en zona roja, y llegan por caminos distintos: R-01, R-02 y R-03 por impacto
alto con probabilidad media; R-04 y R-09 por impacto medio con probabilidad alta.

### Fase 3 · Mitigación

La sesión concluyó con cambios concretos sobre el diseño, detallados en §4.3.

## 4.3 Plan de mitigación de riesgos críticos

| Riesgo | Cambio arquitectónico concreto | Efecto buscado | Riesgo residual |
|---|---|---|---|
| **R-01** 6 | Desarrollo guiado por pruebas sobre `EvaluadorDeMano` y `CalculadorDePuntaje`, que tienen Ce = 0; batería exhaustiva de combinaciones; **prueba de propiedad** que juega miles de turnos aleatorios verificando la invariante `mazo + pozo + manos = 52`; límite de complejidad ciclomática ≤ 10 (FF-08) | Reduce la **probabilidad** de 2 a 1 | **3** · Medio |
| **R-02** 6 | **Instantánea al cerrar cada ronda**: el estado se persiste al terminar cada ronda, de modo que una caída cuesta como máximo la ronda en curso y no la partida completa. Es un cambio aditivo que no altera el estilo | Reduce el **impacto** de 3 a 2 | **4** · Medio |
| **R-03** 6 | Liquidación en **una sola transacción** con bloqueo optimista por `partida.version`; restricción `UNIQUE (participacion_id, ronda_id)` que hace la operación idempotente a nivel de motor; la mesa como unidad de concurrencia en memoria (§2.4) | Reduce la **probabilidad** de 2 a 1 | **3** · Medio |
| **R-04** 6 | **Fitness function FF-06**: los casos de uso no pueden depender de implementaciones concretas de reglas. La disciplina deja de depender de la memoria del equipo y la verifica el pipeline en cada integración | Reduce la **probabilidad** de 3 a 1 | **2** · Bajo |
| **R-09** 6 | **Faseo explícito del MVP**: primero el modo 1v1 contra la máquina, que no necesita salas, sincronización ni espera; el multijugador después. Los puntos de variación (comodín, reingreso) quedan diseñados pero no implementados | Reduce la **probabilidad** de 3 a 2 | **4** · Medio |

### Impacto del plan sobre el diseño

Tres de las cinco mitigaciones modificaron el diseño, que es el objetivo del ejercicio:

1. **R-02 introdujo la instantánea por ronda**, que no estaba contemplada en el Entregable 1.
   Matiza el trade-off T3 sin abandonarlo: la partida sigue viviendo en memoria, pero deja de ser
   el único lugar donde existe.
2. **R-04 añadió la fitness function FF-06**, que no existía. Nació directamente de la
   retroalimentación del Entregable 1.
3. **R-01 añadió la prueba de propiedad sobre la invariante de la baraja**, un tipo de prueba
   distinto de las unitarias que ya había.

Tras la mitigación ningún riesgo permanece en zona roja: el máximo residual es 4, en amarillo.

