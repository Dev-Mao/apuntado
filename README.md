# Apuntado, sistema digital de juego de cartas

Proyecto de la asignatura **Fundamentos de Arquitectura de Software** · Universidad Nacional de
Colombia, Facultad de Minas.

| Rol arquitectónico | Integrante |
|---|---|
| Arquitecto de Negocio | Juan José Chaves Alvear |
| Arquitecto de Aplicaciones y Datos | Joaquín Andrés Escalante |
| Arquitecto Tecnológico / Solución | Mariana Agudelo Ospina |

---

## Estructura del repositorio

```
apps/api/             Servidor: módulos de dominio (ADR-01)
apps/web/             Interfaz web (Next.js, exportación estática)
packages/contracts/   Tipos compartidos entre servidor e interfaz, sin lógica
docs/adrs/            ADR-01 a ADR-05 en formato Nygard
docs/entregable-2/    Secciones del documento del Entregable 2, tal como se entregaron
docs/entregable-3/    Plan de construcción del MVP
models/bpmn/          Procesos As-Is y To-Be (BPMN 2.0 editable)
models/uml/           Casos de uso, componentes y clases (PlantUML y draw.io)
models/er/            Modelo entidad-relación y esquema SQL
tests/architecture/   Fitness functions ejecutables (TSArch)
tests/integration/    Esquema SQL probado sobre PostgreSQL (PGlite)
tests/e2e/            Servidor real jugado con clientes Socket.IO
```

La versión del repositorio entregada con el Entregable 2 está en la etiqueta
[`entregable-2`](https://github.com/Dev-Mao/apuntado/tree/entregable-2).

El servidor se particiona **por dominio de negocio**, no por capa técnica. Cada módulo contiene
sus propias capas:

```
apps/api/src/modules/
├── game/        Juego: reglas, turnos, mesa          ← el único que cambia seguido
│   ├── domain/           entidades, ronda, partida, sesión y servicios puros
│   ├── application/      casos de uso, puertos, vista filtrada y oponente virtual
│   ├── infrastructure/   repositorios, temporizadores y bitácora
│   └── interfaces/       gateway de Socket.IO
├── identity/    Identidad: sesión de invitado con token firmado
├── economy/     Economía: fichas, apuestas, movimientos
└── history/     Historial: resultados y estadísticas
```

---

## Comandos

```bash
npm install
npm test                  # todas las pruebas: servidor, arquitectura, esquema y punta a punta
npm run test:domain       # dominio y aplicación del servidor
npm run test:arch         # fitness functions
npm run test:integration  # esquema SQL sobre PostgreSQL (PGlite, sin Docker)
npm run typecheck         # TypeScript estricto del servidor y los contratos
npm run lint              # incluye el límite de complejidad ciclomática (CC ≤ 10)
npm run arch:deps         # reglas de dependencia (dependency-cruiser)
npm run test:e2e          # servidor real y clientes Socket.IO de punta a punta
npm run api:build         # compilación de producción del servidor
npm run web:check         # tipos, estilo y build de la interfaz web
npm run verificar         # todo lo anterior: exactamente lo que corre el pipeline
npm run build             # compila la interfaz web y el servidor
npm start                 # arranca el servidor en http://localhost:3000 con la interfaz incluida
npm run dev -w @apuntado/web  # interfaz web en modo desarrollo
```

Variables de entorno del servidor:

| Variable | Uso | Por defecto |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `NODE_ENV` | `production` activa las cookies seguras y exige `SESSION_SECRET` | sin definir |
| `SESSION_SECRET` | Clave con que se firman las sesiones | clave de desarrollo |
| `WEB_DIR` | Carpeta de la interfaz compilada | `apps/web/out` |
| `ALLOWED_ORIGINS` | Orígenes adicionales aceptados, separados por comas (por ejemplo, la interfaz en modo desarrollo) | ninguno |

El despliegue en Render está descrito en `render.yaml`: un solo servicio que compila todo, sirve la
interfaz, la API y el socket desde el mismo origen, y genera `SESSION_SECRET` automáticamente.

El flujo `.github/workflows/gobernanza.yml` ejecuta esas mismas etapas en cada subida a `main` y en
cada solicitud de integración, y marca la construcción en rojo si alguna regla de arquitectura se
rompe.

---

## Gobernanza arquitectónica

Las reglas de los ADR no se sostienen con disciplina sino con pruebas que fallan la construcción.

| # | Regla | Protege | Herramienta |
|---|---|---|---|
| FF-01 | Juego no depende de Identidad, Economía ni Historial | ADR-01 | TSArch + dependency-cruiser |
| FF-02 | El dominio no depende de infraestructura, interfaces ni librerías externas | ADR-01 | TSArch + dependency-cruiser |
| FF-03 | Las reglas Clásica y Apuntado no se conocen entre sí | ADR-02 / ADR-03 | TSArch + dependency-cruiser |
| FF-04 | Sin dependencias cíclicas | ADR-01 | TSArch + dependency-cruiser |
| FF-05 | La presentación no alcanza la persistencia ni las entidades | ADR-01 | TSArch + dependency-cruiser |
| FF-06 | Los casos de uso no dependen de reglas concretas | ADR-03 | TSArch |
| FF-07 | `shared/` no contiene lógica de negocio | ADR-01 | dependency-cruiser |
| FF-08 | Complejidad ciclomática ≤ 10 por función | §5.3 de la guía | ESLint |

Además, `packages/contracts` no puede importar nada de las aplicaciones, y la capa de aplicación de
cada módulo no puede importar NestJS, Socket.IO ni otras librerías de infraestructura. El dominio
tampoco puede importar la capa de aplicación.

### Las reglas están verificadas contra violaciones reales

Una prueba de arquitectura que nunca ha fallado no demuestra nada. Estas se validaron
introduciendo violaciones deliberadas y comprobando que **fallan**:

| Violación introducida | Regla que debía detectarla | Resultado |
|---|---|---|
| `classic-rule.ts` importa `apuntado-rule.ts` | FF-03 | Detectada |
| Un archivo de `game/` importa `economy/domain/chip-ledger.ts` | FF-01 | Detectada |
| `interfaces/http/` importa un repositorio de `infrastructure/` | FF-05 | Detectada |
| `packages/contracts` importa un archivo de `apps/api` | Contratos sin dependencias | Detectada |

Ese control negativo reveló un defecto real: el atajo `inFolder()` de TSArch genera un patrón que
**nunca coincide con rutas relativas**, de modo que FF-01 y FF-05 pasaban aunque estuvieran
violadas. Se reescribieron con `matchingPattern` explícito. El análisis está en
[`docs/entregable-2/5-gobernanza-fitness-functions.md`](docs/entregable-2/5-gobernanza-fitness-functions.md).

---

## Estado actual

Fase 3 del [plan de construcción](docs/entregable-3/plan-de-construccion.md): el servidor en tiempo
real funciona de punta a punta.

- Dominio completo: ronda, partida en las modalidades Clásica, Apuntado y Ambas, acumulación y
  eliminación por umbral, vencimiento del turno.
- Salas con código de 4 caracteres, anfitrión, bots, inicio y reconexión con la vista completa.
  Las mesas terminadas o abandonadas se borran tras diez minutos.
- La sesión y el socket solo aceptan peticiones del propio origen.
- Sesión de invitado con token firmado en una cookie `httpOnly`.
- Servidor NestJS con Socket.IO: cada jugador recibe solo su vista; el reloj de turno y el bot juegan
  solos cuando corresponde.
- La interfaz web tiene el sistema de diseño y sus pantallas; falta conectarla al servidor.

```
235 pruebas  ·  210 de servidor + 6 de arquitectura + 10 de esquema + 9 de punta a punta
typecheck limpio  ·  ESLint limpio  ·  0 errores de dependencias
```
