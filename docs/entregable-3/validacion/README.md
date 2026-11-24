# Evidencias de validación con usuarios

Cada participante aparece solo con su código. No se guardan nombres, correos ni otros datos personales.

## Participantes

| Código | Fecha | Dispositivo | Evidencias |
|---|---|---|---|
| U01 | 21 de noviembre de 2026 | Computador, en una copia local del juego | Cuestionario y capturas |
| U02 | 19 de noviembre de 2026 | Celular, Samsung Internet | Cuestionario y capturas |
| U03 | 20 de noviembre de 2026 | Celular, Chrome | Cuestionario y capturas |
| U04 | 21 de noviembre de 2026 | | Cuestionario |
| U05 | 18 de noviembre de 2026 | | Cuestionario |

Tres participantes escribieron U03 como apodo y en el formulario. Se distinguieron por la fecha y la hora de su respuesta y se recodificaron como U02, U03 y U04. La columna `codigo_escrito` del cuestionario guarda el código que escribió cada uno. En las capturas de U02 el apodo que aparece es U03.

## Cuestionario

[cuestionario.csv](cuestionario.csv) tiene las respuestas de las cinco personas: las diez frases de la escala SUS tal como las marcaron, el puntaje SUS calculado, las cuatro calificaciones de 1 a 5 y las tres preguntas abiertas.

| Código | SUS | Satisfacción | Rapidez | Claridad del conteo | Entendió el rechazo |
|---|---|---|---|---|---|
| U01 | 57,5 | 5 | 5 | 4 | 5 |
| U02 | 65 | 5 | 5 | 4 | 3 |
| U03 | 62,5 | 5 | 5 | 5 | 5 |
| U04 | 62,5 | 5 | 5 | 4 | 5 |
| U05 | 37,5 | 3 | 5 | 1 | 1 |
| **Promedio** | **57** | **4,6** | **5** | **3,6** | **3,8** |

## Bitácora de producción

Extraída de la base de datos del despliegue (tablas `partida`, `ronda` y `turno_jugada`). Solo guarda jugadas aceptadas: los cierres rechazados no quedan registrados.

| Archivo | Contenido |
|---|---|
| [partidas.csv](bitacora/partidas.csv) | Cada partida de los participantes: modalidad, rondas y cierres válidos. |
| [tiempos-por-turno.csv](bitacora/tiempos-por-turno.csv) | Turnos jugados, segundos promedio por turno (sin contar los vencidos) y turnos vencidos. |
| [log-partida-ganada-U03.csv](bitacora/log-partida-ganada-U03.csv) | Las 64 jugadas de la partida que ganó U03 el 20 de noviembre, con su hora. |

- U02 jugó con el apodo U03 y U05 con el apodo U08. A U05 se le atribuyen las tres partidas de ese apodo jugadas entre las 00:02 y las 00:07 del 18 de noviembre, cinco minutos antes de su respuesta al cuestionario.
- U01 jugó en una copia local y U04 no tiene partidas en producción, así que ninguno de los dos aparece.
- Las partidas con el apodo U02 entre el 17 y el 19 de noviembre no corresponden a ningún participante y se dejaron fuera.

## U01

Computador, partidas Clásicas contra un bot.

| Captura | Qué muestra |
|---|---|
| [1-inicio.jpg](U01/1-inicio.jpg) | Entra con el apodo U01 y la modalidad Clásica. |
| [2-sala.jpg](U01/2-sala.jpg) | Sala de espera con un bot. |
| [3-cierre-rechazado.jpg](U01/3-cierre-rechazado.jpg) | Envía un cierre con dos cartas sin asignar y el servidor lo rechaza: «Las cartas declaradas no coinciden con su mano». |
| [4-cierre-armado.jpg](U01/4-cierre-armado.jpg) | En otra partida arma un cierre 4-3-3 con todas sus cartas asignadas. |
| [5-resultado.jpg](U01/5-resultado.jpg) | Pierde una partida: el bot cierra primero y U01 queda con 17 puntos. |

## U02

Celular, Samsung Internet, en https://apuntado.onrender.com. Partida Clásica contra un bot.

| Captura | Qué muestra |
|---|---|
| [1-sala.jpg](U02/1-sala.jpg) | Sala de espera con un bot. |
| [2-cierre-rechazado.jpg](U02/2-cierre-rechazado.jpg) | Envía un cierre con cinco cartas sin asignar y el servidor lo rechaza con el mismo mensaje. |
| [3-resultado.jpg](U02/3-resultado.jpg) | El bot cierra primero y U02 queda con 44 puntos. |

## U03

Celular, Chrome, en https://apuntado.onrender.com. Partida Clásica contra tres bots.

| Captura | Qué muestra |
|---|---|
| [1-inicio.jpg](U03/1-inicio.jpg) | Crea la mesa con el apodo U03 y la modalidad Clásica. |
| [2-cierre-rechazado.jpg](U03/2-cierre-rechazado.jpg) | Declara un cierre con cartas sin asignar y el servidor lo rechaza: «Las cartas declaradas no coinciden con su mano». |
| [3-resultado.jpg](U03/3-resultado.jpg) | Gana la partida con un cierre clásico (4-3-3). |
