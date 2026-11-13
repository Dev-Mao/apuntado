# Diagramas UML del MVP

Las fuentes están en PlantUML (`.puml`), igual que las figuras del Entregable 2. Cada diagrama
tiene su `.svg`, generado con el servidor de PlantUML, y su `.png` en alta resolución, sacado del
SVG para el documento. Todo nombre de clase, método, puerto y protocolo sale del código del
repositorio.

| Diagrama | Fuente | Imagen |
|---|---|---|
| Despliegue | [despliegue.puml](despliegue.puml) | [despliegue.svg](despliegue.svg) |
| Secuencia del cierre y la liquidación | [secuencia-cierre.puml](secuencia-cierre.puml) | [secuencia-cierre.svg](secuencia-cierre.svg) |
| Clases de implementación | [clases.puml](clases.puml) | [clases.svg](clases.svg) |

## Despliegue (`despliegue.puml`)

- **Dispositivo del jugador.** El navegador ejecuta la interfaz exportada por Next.js y el cliente
  de Socket.IO. No calcula reglas: muestra la vista que le manda el servidor.
- **Render.** Un solo servicio web con Node.js 22 corre `apps/api/dist/main.js`. Ese proceso sirve
  el sitio estático de `apps/web/out`, la API REST y el gateway de Socket.IO desde el mismo origen,
  así que la cookie de sesión es de primera parte. Render termina TLS en su borde y reenvía al
  puerto del contenedor.
- **Neon.** PostgreSQL administrado con el `schema.sql` del Entregable 2 y las migraciones 002 a 005,
  que el servidor aplica al arrancar. El driver es `pg` con un pool de cinco conexiones sobre TLS.
- **GitHub.** Cada solicitud de integración corre `gobernanza.yml` en GitHub Actions. Al integrar en
  `main`, Render compila y despliega automáticamente.
- **Protocolos.** Hay tres caminos: HTTPS para el sitio y la API, WSS para Socket.IO, y TCP 5432
  para PostgreSQL. Entre la API y el gateway la comunicación es en memoria, porque son el mismo
  proceso (ADR-03).

## Secuencia del cierre y la liquidación (`secuencia-cierre.puml`)

El flujo empieza cuando el jugador envía el cierre desde el diálogo. Para que el diagrama quepa en
una página, algunas clases que colaboran comparten línea de vida (por ejemplo `GameSession` y
`Round`). Los papeles que pide la guía corresponden a estas clases:

| Papel en la guía | Clase |
|---|---|
| GameOrchestrator | `DeclareClosure` (caso de uso) con `GameSession` y `Round` |
| HandEvaluator, plug-in de regla | `GameRule`, implementada por `ClassicRule` y `ApuntadoRule`, que usan `HandEvaluator` |
| ScoringService | `RoundSettler`, `HandArranger` y `ScoreCalculator` |
| Repository/DB | `PgPlayJournal`, y `MatchArchiver` y `ChipBank` escribiendo en PostgreSQL por la cola de escritura |

- **Escenario 1, Clásica.** `ClassicRule` exige una cuarta, dos ternas, ninguna sobrante y una
  carta de descarte. La partida termina en esa ronda.
- **Escenario 2, Apuntado.** `ApuntadoRule` exige tres ternas y sobrantes por debajo de 5 puntos;
  con 5 o más rechaza el cierre e informa la suma, que es el fragmento `break`. Si el cierre es
  válido, `RoundSettler` calcula la penalización de cada perdedor con su mejor agrupación y `Match`
  la acumula. Quien llega al umbral (101 por defecto) queda eliminado, y cuando solo queda un
  jugador la partida termina.

Después de la decisión, el caso de uso publica `RondaCerrada` y, si corresponde,
`PartidaFinalizada`. El historial y la economía los reciben como microtareas, sin que el juego los
conozca (ADR-01), y escriben en PostgreSQL de forma asíncrona. El jugador recibe la confirmación y
la vista nueva de la mesa sin esperar a la base de datos (ADR-04).

## Clases de implementación (`clases.puml`)

- **Strategy.** El desacoplamiento de reglas es un Strategy con registro: `GameRule` es la
  estrategia, `ClassicRule` y `ApuntadoRule` las implementaciones, y `RuleResolver` el registro que
  elige la regla según el tipo de cierre y las modalidades habilitadas. Una regla nueva se agrega con
  `register` sin tocar `GameSession` ni el caso de uso (ADR-03).
- **Funciones puras.** Los servicios del dominio (`HandEvaluator`, `HandArranger`, `MeldCandidates`,
  `ScoreCalculator`, `RoundSettler`, `ClosureFinder`) son módulos de funciones puras. Se dibujan
  como clases `«utility»` porque así los modela UML. Las funciones marcadas `-` no se exportan del
  módulo.
- **Entrada.** `TableGateway` y `TableCommands`, que reciben el socket y traducen la petición,
  aparecen en la secuencia y no se repiten aquí.
- **Puertos y adaptadores.** El caso de uso depende de puertos (`GameRepository`, `PlayJournal`,
  `EventBus`), que los adaptadores de infraestructura implementan.
- **Visibilidad.** `+` es público, `-` privado y `{readOnly}` corresponde a `readonly` en
  TypeScript. Los tipos son los del código.
