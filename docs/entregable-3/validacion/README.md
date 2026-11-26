# Evidencias de validación con usuarios

Cada participante aparece solo con su código. No se guardan nombres, correos ni otros datos personales.

Hubo dos rondas con el mismo protocolo. La ronda 1 (U01 a U05, del 18 al 21 de noviembre) usó la primera versión del juego. La ronda 2 (U06 a U08, desde el 25 de noviembre) usa la versión con las mejoras que salieron de la ronda 1, y está al final de este documento.

## Participantes

| Código | Fecha | Dispositivo | Evidencias |
|---|---|---|---|
| U01 | 21 de noviembre de 2026 | Computador, en una copia local del juego | Cuestionario y capturas |
| U02 | 19 de noviembre de 2026 | Celular, Samsung Internet | Cuestionario y capturas |
| U03 | 20 de noviembre de 2026 | Celular, Chrome | Cuestionario y capturas |
| U04 | 21 de noviembre de 2026 | | Cuestionario |
| U05 | 18 de noviembre de 2026 | | Cuestionario |

Tres participantes escribieron U03 como apodo y en el formulario. Se distinguieron por la fecha y la hora de su respuesta y se recodificaron como U02, U03 y U04. La columna `codigo_escrito` del cuestionario guarda el código que escribió cada uno. En las capturas de U02 el apodo que aparece es U03.

## Grabaciones

Grabaciones de pantalla de las dos sesiones en celular:

- [Sesión de U02, 19 de noviembre](https://drive.google.com/file/d/15tkE_LXNDrma0I1Qez15Hx4M8Ve9Wjd2/view?usp=sharing)
- [Sesión de U03, 20 de noviembre](https://drive.google.com/file/d/1t8etVkOrz9ULeKVnd2NFdG0REzql4s71/view?usp=sharing)

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

- U02 jugó con el apodo U03 y U05 con el apodo U08. A U05 se le atribuyen las tres partidas de ese apodo jugadas entre las 00:02 y las 00:07 del 18 de noviembre, cinco minutos antes de su respuesta al cuestionario. Las otras dos partidas de U08, la noche del 17 de noviembre, no se cuentan porque no se puede asegurar que fueran suyas.
- U01 jugó en una copia local y U04 no tiene partidas en producción, así que ninguno de los dos aparece.
- Las partidas con el apodo U02 entre el 17 y el 19 de noviembre no corresponden a ningún participante y se dejaron fuera.

Las consultas SQL que produjeron estos archivos están en [consultas-ronda-1.sql](bitacora/consultas-ronda-1.sql). Las de la ronda 2 están en [consultas-ronda-2.sql](bitacora/consultas-ronda-2.sql).

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

## Ronda 2

Mismo guion, mismo cuestionario y mismas consultas a la bitácora, con la versión actual del juego, que en pantalla se llama La Terna. Los participantes son personas distintas a las de la ronda 1.

Las consultas de la ronda 2 filtran desde el 25 de noviembre. En la ronda 1, U05 jugó con el apodo U08 y sus partidas no deben mezclarse con las del U08 de esta ronda.

### U08

25 de noviembre de 2026, computador, en https://apuntado.onrender.com. A diferencia de la ronda 1, U08 entró con una cuenta registrada y jugó en la misma mesa con U06 y U07, no contra la máquina. La mesa usó la modalidad Ambas, eliminación a 101 puntos, turnos de 120 segundos y una apuesta de 500 fichas por jugador.

| Captura | Qué muestra |
|---|---|
| [1-ajustes.jpg](U08/1-ajustes.jpg) | Ajusta la mesa: eliminación a 101, turnos de 120 segundos y apuesta de 500 fichas, con un saldo de 1000. |
| [2-sala.jpg](U08/2-sala.jpg) | Sala de espera como anfitrión, con U07 sentado. La máquina no se ofrece porque la mesa tiene apuesta. |
| [3-mesa.jpg](U08/3-mesa.jpg) | Primera ronda con U06 y U07. |
| [4-fin-ronda-2.jpg](U08/4-fin-ronda-2.jpg) | Fin de la segunda ronda: U07 cierra con cierre clásico y U08 suma 14 puntos. |
| [5-perfil.jpg](U08/5-perfil.jpg) | Perfil al terminar: una partida ganada, cuatro rondas ganadas, dos cierres por apuntado y un bote de 1500 fichas. |
