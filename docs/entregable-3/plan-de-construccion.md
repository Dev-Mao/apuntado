# Plan de construcción del MVP (Entregable 3)

Este documento fija cómo vamos a construir el MVP: qué decidimos, en qué orden y cómo sabemos que
cada fase terminó. Parte del plan técnico del Entregable 1 (`Entregable 1/insumos/plan-tecnico.md`)
y de los ADR-01 a ADR-05, y señala dónde nos apartamos de ellos y por qué.

## Decisiones

| Tema | Decisión | Relación con lo planeado |
|---|---|---|
| Repositorio | Un solo monorepo con npm workspaces: `apps/api`, `apps/web` y `packages/contracts` | El E1 proponía pnpm y Turborepo. Usamos npm porque el repositorio y el CI ya lo usan; Turborepo solo aportaba caché |
| Servidor | NestJS con Socket.IO | Igual al E1 |
| Interfaz | Next.js exportado como sitio estático | Igual al E1 en framework. El sitio estático lo sirve el propio servidor (ver despliegue) |
| Contratos | `packages/contracts` contiene solo tipos: comandos, eventos y vistas. Nunca lógica | Igual al E1. El motor de reglas no se comparte con el cliente |
| Base de datos | PostgreSQL con el `schema.sql` del E2 y el driver `pg` | El E1 proponía Prisma. Prisma no maneja bien la vista, los CHECK y los ENUM que el E2 ya diseñó y probó; se documenta como desviación en la retrospectiva |
| Despliegue | Un solo servicio en Render: NestJS sirve la API, el socket y el sitio estático. PostgreSQL administrado en Neon | El E1 separaba el front en Vercel. Con dominios distintos, la cookie de sesión se vuelve de terceros y Safari la bloquea. Un solo servicio lo evita y es coherente con el quantum único del ADR-03 |
| Autenticación | Propia y mínima: un token firmado en una cookie `httpOnly` de 7 días, igual para invitados y registrados. Contraseñas con Argon2 | El E1 usaba un par de tokens de acceso y refresco. Lo simplificamos a uno; sin verificación de correo ni recuperación de contraseña |
| Modalidades | Clásica (una ronda, cierre 4-3-3), Apuntado a 101 (varias rondas, cierre por apuntado) y Ambas (varias rondas con los dos cierres) | Cubre el RF-CF-01, el reglamento y la guía del E3 |
| Apuesta | Opcional por mesa; 0 significa jugar sin fichas. Un invitado nunca apuesta | Igual al E1 |
| Cartas | La baraja la maneja el dominio. El cliente recibe `{ rank, suit }` y lo traduce a una imagen (`7H.png`, `back.png`) | No se usa ninguna API externa de cartas |

## Fases del servidor

Cada fase deja algo verificable y no se avanza sin que la anterior funcione.

| Fase | Qué se construye | Terminada cuando |
|---|---|---|
| 0. Monorepo | Estructura de workspaces, paquete `contracts`, fitness functions y CI adaptados | El pipeline pasa con las mismas 44 pruebas y las reglas siguen detectando violaciones con las rutas nuevas |
| 1. Dominio | Baraja con semilla, reparto, pozo, turno, reciclado del pozo (máximo dos por ronda), mejor agrupación de una mano, liquidación de ronda, umbral y empates | Una partida completa se simula en una prueba, la invariante de las 52 cartas se mantiene en una prueba de propiedad y pasan los casos borde del checklist |
| 2. Aplicación | Casos de uso, vista filtrada por jugador, reloj de turno con reloj inyectado, oponente virtual | Una partida 1v1 contra el bot termina con un ganador sin red ni interfaz |
| 3. API en tiempo real | NestJS, gateway de Socket.IO, invitado con token, salas por código, reconexión con snapshot, procesamiento en serie por mesa, primer despliegue | Cuatro clientes juegan por socket; uno se desconecta, vuelve y recupera su vista |
| 4. Persistencia e historial | Repositorios con `pg`, migraciones desde `schema.sql`, bitácora asíncrona (cierra la deuda de C-07), archivado por evento, perfil | Al terminar una partida aparece en el perfil |
| 5. Identidad y economía | Registro e inicio de sesión, saldo, retención de la apuesta con `StakeGuard`, bote al ganador, libro de movimientos | El libro cuadra con el saldo y un invitado no puede apostar |
| 6. Gobernanza ampliada | Reglas para `web` y `contracts`, reporte de Ce, Ca, inestabilidad, abstracción y distancia a la secuencia principal, aproximación a Deméter, cobertura, un flujo E2E | Todo corre en el pipeline |

## Interfaz

Se construye en paralelo desde la fase 1, en una rama propia, empezando por el sistema de diseño
con datos simulados. Se conecta a los contratos reales cuando la vista del jugador esté lista
(fase 2). Sigue las reglas del MCP `ml-web` del equipo: componentes de máximo 200 líneas, lógica en
hooks, `index.ts` por carpeta, accesibilidad y textos con i18n.

## Forma de trabajo

- Una rama por fase y una solicitud de integración hacia `main`, con el CI en verde.
- Commits pequeños, en inglés y con Conventional Commits (`feat(game): ...`, `test(game): ...`).
- Antes de cada commit, `npm run verificar` en verde.
- Código sin comentarios salvo para explicar un porqué no obvio; complejidad ciclomática de 10 como
  máximo; sin `any`.
- La plantilla de la solicitud de integración trae los checklists del capítulo 24 de Richards y
  Ford (código, pruebas y release), que son la evidencia de la sección 2.3 del documento.

## Lo que queda fuera

Comodín, reingreso de eliminados, penalización por apuntado y bajada progresiva siguen siendo
puntos de variación diseñados y no construidos. Sirven de ejemplo de extensibilidad en la
sustentación.

La versión del repositorio entregada con el Entregable 2 está en la etiqueta `entregable-2`.
