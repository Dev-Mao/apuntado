# Validación con usuarios reales (sección 3)

Kit para correr las sesiones con 3 a 5 personas ajenas al equipo y llenar las secciones 3.1 a 3.4
del documento. Todo lo que se recoja va en [`evidencias/`](evidencias/), que es la carpeta `/docs`
con evidencias que pide la guía.

| Archivo | Para qué |
|---|---|
| Este README | Protocolo: participantes, preparación, guion de tareas y métricas |
| [hoja-de-observacion.md](hoja-de-observacion.md) | Una copia por participante; la llena quien observa durante la sesión |
| [cuestionario.md](cuestionario.md) | SUS y preguntas abiertas; lo responde el participante al terminar |
| [resultados.csv](resultados.csv) | Tabla consolidada de la sección 3.3 (se abre en Excel o Google Sheets) |
| [consultas-bitacora.sql](consultas-bitacora.sql) | Consultas para sacar de la base los tiempos por turno y el log de cada partida |

## 3.1 Diseño del protocolo

**Población.** De 3 a 5 personas que no hayan participado en el desarrollo: amigos, familiares o
compañeros de otros cursos. Conviene mezclar quien ya juega cartas con quien no conoce el
Apuntado, y anotar ese perfil en la hoja de observación.

**Roles del equipo en cada sesión.**
- *Facilitador:* lee el guion y no ayuda con el juego. Si el participante pregunta cómo se hace
  algo, responde "¿qué intentarías?". Solo interviene si se bloquea más de 2 minutos, y eso queda
  anotado como ayuda.
- *Observador:* llena la hoja de observación, cronometra las tareas y anota errores y comentarios.

**Preparación (5 minutos antes).**
1. Abrir https://apuntado.onrender.com en una ventana de incógnito, para que el participante entre
   como invitado nuevo. Render apaga el servicio gratuito cuando está inactivo: abrir el enlace un
   minuto antes para que despierte.
2. Iniciar la grabación de pantalla (OBS, la grabación de Windows con Win+Alt+R o la del celular).
3. Pedir permiso para grabar y para usar las capturas en el informe. Decir que se evalúa el sistema,
   no a la persona.
4. Pedir al participante que piense en voz alta mientras juega.

**Apodo.** Cada participante entra con su código como apodo: `U01`, `U02`, y así. Con ese apodo
las consultas de la bitácora encuentran sus partidas.

### Guion de tareas

El facilitador lee cada tarea tal cual, sin explicar la interfaz.

| # | Tarea (lo que se lee) | Se cumple cuando |
|---|---|---|
| T1 | "Entra con el apodo que te di, elige la modalidad Clásica y empieza una partida contra la máquina." | Está en la mesa con la máquina como rival |
| T2 | "Juega tres turnos completos: roba del mazo o del pozo, organiza tu mano y descarta." | Completó tres turnos sin ayuda |
| T3 | "Cuando creas que puedes cerrar, declara el cierre." | El servidor acepta un cierre válido |
| T4 | "Ahora intenta a propósito un cierre que no sea válido y cuéntame qué te dice el juego." | Ve el rechazo y explica con sus palabras por qué no era válido |
| T5 | "Crea una mesa nueva en modalidad Apuntado contra la máquina y juega rondas seguidas hasta que alguien quede eliminado al pasar el umbral." | Ve la acumulación de puntos y el fin de la partida |

**Sobre T3 y T4.** Si en Clásica la mano no permite un cierre válido en un tiempo razonable (unos
10 minutos), se pasa a T5 y se intenta el cierre válido en Apuntado. Se anota en qué modalidad lo
logró. T4 se puede hacer en cualquier turno: basta con declarar un cierre que no cumpla la regla.

**Sobre T5.** Llegar a 101 puntos puede tomar varias rondas. Si el tiempo de la sesión no alcanza,
crear la mesa con un umbral menor (por ejemplo 40) y anotarlo; el mecanismo que se observa es el
mismo. Al menos una de las sesiones debería jugar con el umbral de 101.

Duración estimada por persona: de 25 a 35 minutos, más 5 de cuestionario.

### Métricas que se recogen

| Métrica | Cómo se mide | Dónde queda |
|---|---|---|
| Éxito en el cierre | Si logró un cierre válido (T3) sin ayuda, con ayuda o no lo logró | Hoja de observación |
| Errores y confusiones | Cada momento en que el participante se equivoca, duda o no entiende una regla o un mensaje | Hoja de observación |
| Comprensión del rechazo | Si en T4 explica correctamente por qué el cierre no era válido | Hoja de observación |
| Tiempo promedio por turno | Calculado desde la bitácora del sistema (`turno_jugada`), que guarda la hora de cada jugada | `consultas-bitacora.sql` |
| Latencia percibida | Pregunta del cuestionario: de 1 (muy lenta) a 5 (inmediata) | Cuestionario |
| Satisfacción | Calificación de 1 a 5 y puntaje SUS de 0 a 100 | Cuestionario |

### Consultas de la bitácora

`consultas-bitacora.sql` trae cuatro consultas de solo lectura, en este orden, para correr en el
editor SQL de Neon (proyecto apuntado, rama production). Si los participantes usaron otros apodos,
hay que cambiar la lista `('U01', ..., 'U05')`.

1. Las partidas de cada participante: modalidad, umbral, estado, rondas y ganador.
2. El tiempo promedio por turno, en segundos. Un turno dura desde que terminó el anterior (o empezó
   la ronda) hasta la última jugada del participante. Los turnos que llegaron al límite del reloj se
   cuentan aparte, porque ahí el sistema jugó por la persona.
3. Los cierres válidos que logró cada participante, por tipo.
4. El log completo de una partida, jugada por jugada. Se reemplaza el identificador de ejemplo por
   uno de la consulta 1 y se exporta el resultado como CSV.

Los cierres inválidos no quedan en la bitácora: el sistema los rechaza antes de escribir nada
(ADR-05, C-06). Por eso los registra el observador.

## 3.2 Registro de evidencias

En [`evidencias/`](evidencias/) va, por participante:
- capturas de la mesa, del rechazo de T4 y de la pantalla final;
- el enlace a la grabación (subida a Drive o YouTube como no listada; el video no va al repositorio);
- la hoja de observación llena y el cuestionario respondido (foto o PDF);
- el log de sus partidas exportado con la consulta 4 de `consultas-bitacora.sql`.

Antes de subir, tapar o recortar cualquier dato personal: nombres reales, caras y notificaciones.

## 3.3 Análisis

Con las hojas y los cuestionarios, llenar [resultados.csv](resultados.csv) y calcular:
- la tasa de éxito en el cierre (participantes que lo lograron entre el total);
- los errores más repetidos, agrupados por tipo (pozo frente a mazo, conteo de sobrantes, orden de
  la escalera, mensajes del sistema...);
- el promedio del tiempo por turno, de la satisfacción y del SUS. Un SUS de 68 es el promedio de
  referencia, y por encima de 80 se considera muy bueno.

## 3.4 Plan de mejoras

La guía pide al menos dos ajustes que salgan de lo que dijeron los usuarios. Por cada uno anotar:
lo observado (con el ID del participante), el cambio propuesto, en qué parte de la arquitectura cae
(interfaz, regla o mensaje del servidor) y si se hizo o queda pendiente. Si un ajuste se implementa
antes de la entrega, enlazar el commit.
