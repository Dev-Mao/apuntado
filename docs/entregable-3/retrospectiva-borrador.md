# Retrospectiva arquitectónica (borrador para el equipo)

Este borrador reúne los hechos que ya están en el repositorio: el plan de construcción, los ADR,
los commits y las métricas del pipeline. Las opiniones y la experiencia del equipo van donde dice
**[Equipo]**. La idea es que lo revisen, corrijan lo que no les suene y lo escriban con su voz
antes de pasarlo al PDF.

## 5.1 Alineación entre arquitectura e implementación

### Lo que se sostuvo

Las fronteras principales del diseño llegaron intactas al código, y no por disciplina: las vigila
el pipeline en cada solicitud de integración desde la fase 0.

- **Particionamiento por dominio (ADR-01).** Los cuatro módulos existen tal como se diseñaron.
  Juego no importa nada de Identidad, Economía ni Historial (FF-01), y los otros tres se enteran de
  lo que pasa en la mesa por eventos. El reporte de métricas lo confirma: el módulo de juego no
  tiene ninguna dependencia hacia los otros dominios.
- **Monolito modular (ADR-03).** Hay un solo desplegable en Render y un solo proceso. Los módulos
  se comunican en memoria.
- **Reglas como Strategy (ADR-02 y ADR-03).** `ClassicRule` y `ApuntadoRule` implementan `GameRule`
  y no se conocen entre sí (FF-03). `RuleResolver` elige la regla según el tipo de cierre y la
  modalidad. El paquete de reglas tiene D = 0,39 y complejidad máxima 7.
- **Sincronía y eventos (ADR-05).** La validación del cierre es una llamada directa. La consulta de
  fondos antes de apostar es una interfaz invertida (`StakeGuard`, declarada por Juego e
  implementada por Economía). Los efectos posteriores (historial, bote) son eventos locales. La
  bitácora quedó fuera del camino crítico del turno, y una prueba automatizada (C-07) lo demuestra.
- **El cliente no calcula reglas.** La interfaz recibe una vista filtrada por jugador y muestra el
  motivo que da el servidor cuando rechaza un cierre. FF-12 impide que la web importe código del
  servidor.

### Donde hubo deriva

| Diseño | Implementación | Por qué |
|---|---|---|
| ADR-02: tres puntos de extensión (`ReglaJuego`, `PoliticaDeEliminacion`, `SistemaDeApuestas`) | Solo existe `GameRule`. La eliminación por umbral vive en `Match` (con el umbral configurable) y la apuesta fija con bote al ganador vive en `ChipLedger` | Para el MVP había una sola política de eliminación y una sola de apuestas. Una interfaz con una única implementación habría sido abstracción especulativa. Extraerlas cuando aparezca la segunda variante (reingreso, apuestas variables) es un cambio local, porque ya están en una sola clase cada una |
| ADR-02: un `OrquestadorDeTurnos` | La orquestación se repartió entre casos de uso pequeños (`DeclareClosure`, `DrawCard`, `DiscardCard`, `TimeOutTurn`, `StartNextRound`) y un `TableCoordinator` que maneja relojes y el bot | Un solo orquestador concentraba demasiadas razones para cambiar. Cada caso de uso quedó por debajo de complejidad 10 |
| E1: pnpm y Turborepo | npm workspaces | El repositorio y el CI ya usaban npm; Turborepo solo aportaba caché |
| E1: Prisma | `pg` con el `schema.sql` del E2 | Prisma no maneja bien la vista, los CHECK y los ENUM que el E2 diseñó y probó |
| E1: interfaz en Vercel y servidor aparte | Un solo servicio en Render que sirve el sitio, la API y el socket | Con dominios distintos la cookie de sesión es de terceros y Safari la bloquea |
| E1: par de tokens de acceso y refresco | Un solo token en cookie `httpOnly` de 7 días | Menos piezas para el MVP; el costo es que cerrar sesión no invalida el token |
| E2 §2.4: la liquidación se persiste dentro del turno | La partida en curso vive en memoria y la liquidación se persiste justo después, por una cola en serie | Mantiene la base fuera del camino crítico (ADR-05). Si el servidor cae entre los dos momentos, esa ronda no queda registrada |
| Reglamento del E1: la terna era solo del mismo valor | La terna también puede ser una escalera de tres del mismo palo, con el as abajo | Decisión de producto al construir el MVP, que hay que actualizar en el reglamento |

**[Equipo]** ¿Alguna de estas desviaciones se discutió más de lo necesario, o alguna que no está
aquí la vivieron como deriva?

## 5.2 Las leyes de la arquitectura frente al MVP

### Primera ley: todo en arquitectura es un trade-off

| Decisión | Lo que se ganó | Lo que se pagó |
|---|---|---|
| Estado de la partida en memoria (ADR-04 y ADR-05) | Turnos sin esperar a la base de datos; el cierre responde aunque la escritura esté bloqueada (C-07) | Una caída o un redespliegue termina las partidas en curso; una partida interrumpida queda `EN_CURSO` en la base |
| Saldos en memoria para que `StakeGuard` sea síncrono | La retención de la apuesta se decide en el mismo turno, sin una llamada remota | Si una escritura falla, la memoria y el libro difieren hasta el siguiente arranque. Durante un despliegue con dos servidores vivos, una partida puede terminar con la apuesta devuelta en lugar de pagada. La migración 005 impide que se pague dos veces |
| Un solo servicio en Render | Cookie de primera parte, un despliegue, un dominio y menos costo | El sitio estático no se sirve desde una CDN ni escala aparte de la API |
| Una sola cola de escritura en serie | Una jugada nunca llega a la base antes que su ronda; sin bloqueos ni condiciones de carrera | Todas las escrituras compiten por la misma fila de espera. Sirve para una instancia, no para miles de partidas simultáneas |
| `pg` y SQL a mano | Las invariantes del E2 viven en la base (`UNIQUE`, CHECK, ENUM) y atraparon errores reales | Más código de mapeo y consultas escritas a mano |
| Strategy solo donde hay variación | Agregar una regla es una clase y un `register` | Las otras dos variaciones previstas exigirán una refactorización cuando lleguen |
| Bot que busca cierres (`findClosure`) | La máquina juega rondas completas y gana cerrando | Es la parte más compleja del dominio en búsqueda combinatoria, aunque cada función siga por debajo de complejidad 10 |

### Segunda ley: el porqué es más importante que el cómo

Los ADR del Entregable 2 fueron suficientes para construir sin rediscutir lo central. Cada vez que
el código se apartó de ellos, la desviación quedó escrita en el plan de construcción junto con su
razón. No se reabrió la decisión.

| ADR | ¿Se sostuvo? | Lo que enseñó el código |
|---|---|---|
| ADR-01 Particionamiento por dominio | Sí | Las fitness functions lo protegen. Al validarlas con violaciones deliberadas apareció un defecto de TSArch (`inFolder()` nunca coincidía) que dejaba pasar violaciones reales |
| ADR-02 Strategy para las reglas | En parte | La regla de juego sí. Los otros dos puntos de extensión se postergaron (ver 5.1) |
| ADR-03 Monolito modular | Sí | Un solo proceso simplificó la sesión, los eventos y el despliegue |
| ADR-04 PostgreSQL relacional | Sí, con desviaciones documentadas | Las restricciones declarativas atraparon errores que el código no veía: una liquidación doble y, en la fase 5, el pago doble del bote durante un despliegue |
| ADR-05 Llamadas directas y eventos | Sí | El orden de suscripción importa: Historial debe escuchar antes que Economía porque el movimiento de fichas referencia la partida. Es un acoplamiento implícito; lo protege una prueba de punta a punta |

**[Equipo]** ¿Hubo discusiones circulares (el antipatrón *Groundhog Day*) durante el proyecto?
¿Alguna decisión se tomó dos veces porque no había quedado escrita?

### Tercera ley: las decisiones viven en un espectro

- **Estilo.** Se eligió un monolito modular, a medio camino entre un monolito sin fronteras y
  microservicios. Tiene un solo quantum arquitectónico pero cuatro módulos con fronteras vigiladas.
  Eso permite extraer un módulo después sin reescribir el juego.
- **Comunicación.** Es híbrida: síncrona donde el resultado decide el turno y asíncrona donde es un
  efecto. No se usó un broker, porque los eventos son locales.
- **Consistencia.** Es fuerte en la base de datos (transacciones e invariantes) y eventual entre el
  estado en memoria y lo persistido.
- **Extensibilidad.** Strategy ocupa un punto medio entre una condición `if` por modalidad y un
  microkernel con carga dinámica de plug-ins. Tiene la forma del microkernel sin su
  infraestructura, porque las reglas las escribe el mismo equipo y se despliegan con el núcleo.

## 5.3 Lecciones aprendidas y trabajo futuro

### Lo que aprendimos

- **Una fitness function que nunca falló no demuestra nada.** Cada regla se probó con una
  violación deliberada, y así apareció el defecto de `inFolder()`.
- **Las revisiones independientes encontraron defectos reales** que las pruebas no cubrían: un
  error del pool de conexiones que tumbaba el servidor, la condición de carrera en el registro, el
  pago doble durante un despliegue y vistas que no se podían usar en un celular horizontal.
- **Medir cambia el código.** La cobertura encontró código muerto y la aproximación a Deméter
  encontró ocho accesos encadenados al socket.
- **Las métricas necesitan contexto.** Cuatro paquetes caen en la zona de dolor (carta y baraja,
  dominio de identidad, `shared` y `health`). Son concretos y estables pero casi no cambian, así
  que el riesgo que describe Martin no aplica.

**[Equipo]** Lecciones propias del trabajo en equipo, de la validación con usuarios y de los
roles.

### Si el juego escalara a un torneo nacional de 100 000 jugadores simultáneos

Hoy hay un solo quantum: un proceso con el estado de todas las mesas en memoria, una instancia de
Render y una cola de escritura. Con 100 000 jugadores habría entre 25 000 y 50 000 mesas abiertas a
la vez. Eso no cabe en un proceso. Los cambios irían en este orden:

1. **Partir el juego por mesa.** La mesa es la unidad natural de partición, porque cada partida es
   independiente. Varias instancias del módulo de juego, cada mesa asignada a una instancia por su
   código, y sesiones pegajosas para que los sockets de una mesa lleguen a la misma instancia. El
   adaptador de Socket.IO con Redis reparte los mensajes entre instancias.
2. **Separar quanta según su consistencia.** Juego, con estado y particionado, sería un quantum.
   Economía necesita consistencia fuerte y sería otro, dueño de su libro. Historial tolera
   consistencia eventual y sería un tercero. Identidad, sin estado y fácil de replicar, el cuarto.
   Las fronteras ya existen y están vigiladas, así que esto es extraer módulos, no rediseñarlos.
3. **Pasar a una arquitectura orientada a eventos.** Los eventos locales (`PartidaFinalizada`,
   `RondaCerrada`) pasarían a un broker durable (Kafka o NATS). Así sobreviven a un reinicio, que hoy
   es uno de los trade-offs aceptados del ADR-05.
4. **Cambiar la retención síncrona por una reserva.** `StakeGuard` dejaría de leer un saldo en
   memoria y pediría a Economía una reserva con confirmación o compensación (una saga), porque
   habría varias instancias de juego pidiendo fondos a la vez.
5. **Escalar la persistencia.** La cola en serie se reemplaza por escrituras por partición y un pool
   de conexiones administrado (el pooler de Neon o PgBouncer). El perfil se lee de un modelo de
   lectura alimentado por eventos, no de las tablas de escritura.
6. **Servir la interfaz desde una CDN.** Con la sesión en un dominio propio y la API detrás de un
   balanceador, el motivo original para un solo servicio (la cookie) se resuelve con un subdominio
   del mismo sitio.

Lo que no cambia es el dominio: las reglas, la ronda y la partida siguen siendo código puro sin red
ni base de datos (FF-02). Por eso se pueden mover de proceso sin tocarlas.
