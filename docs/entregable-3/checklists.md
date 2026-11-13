# Checklists de ingeniería (sección 2.3)

Son los tres checklists del capítulo 24 de Richards y Ford, aplicados al MVP antes de la entrega.
Cada solicitud de integración los trae en su plantilla
([`.github/pull_request_template.md`](../../.github/pull_request_template.md)). Varios puntos no
dependen de que alguien se acuerde: el pipeline los verifica y rompe la construcción si fallan.

Estado al 13/11/2026, revisión `main` posterior a la PR #19.

## Developer code-completion checklist

| Punto | Estado | Evidencia |
|---|---|---|
| Sin `console.log`, `debugger` ni código de depuración | Cumple | Una búsqueda en `apps/api/src`, `apps/web/src` y `packages` no encuentra ningún `console.*` ni `debugger`. Los registros del servidor pasan por el `Logger` de NestJS |
| Ninguna excepción absorbida en silencio | Cumple | Hay 13 `catch` en el código de producción. Cada uno hace una de estas cosas: registra el error (cola de escritura, temporizadores y rollback de transacciones, que van al `Logger`), lo traduce a un resultado del dominio (un token inválido es "sin sesión" y una violación de unicidad es "correo ocupado"), lo vuelve a lanzar, o le muestra al jugador "No pudimos comunicarnos con el servidor" en la interfaz. El único descartado es el rechazo de una animación cancelada en `lib/flight.ts`, que no es un error |
| Sin `any`, `@ts-ignore` ni `eslint-disable` | Cumple | TypeScript estricto con `noUncheckedIndexedAccess`; ninguna aparición en el repositorio |
| Complejidad ciclomática ≤ 10 por función | Cumple, verificado en CI | ESLint (FF-08). Máximo actual 10; el 93 % de las 557 funciones está por debajo de 5, y la evaluación de ternas y cuartas llega como máximo a 7 |
| Código sin comentarios, módulos pequeños | Cumple | Regla del equipo. Las razones quedan en los ADR, los commits y las solicitudes de integración |
| Sin código muerto | Cumple | dependency-cruiser avisa de archivos huérfanos. La cobertura de la fase 6 encontró dos restos sin uso y se borraron |
| Reglas de arquitectura respetadas | Cumple, verificado en CI | FF-01 a FF-13: aislamiento de módulos, dominio puro, reglas independientes, sin ciclos, la interfaz no toca la persistencia, Deméter, distancia a la secuencia principal y cohesión |

## Unit and functional testing checklist

| Punto | Estado | Evidencia |
|---|---|---|
| Ternas incompletas | Cumple | `round.test.ts` "rechaza una terna incompleta"; `rules.edge-cases.test.ts` "rechaza tres ternas incompletas" y "rechaza una cuarta con una terna incompleta" |
| Sobrantes que suman exactamente 5 en Apuntado (inválido) | Cumple | `round.test.ts` "rechaza sobrantes que suman exactamente 5"; `rules.edge-cases.test.ts` verifica el motivo y la suma informada. Si se cambia `>=` por `>` en la regla, la prueba falla |
| Sobrantes por debajo de 5 (válido) | Cumple | `rules.edge-cases.test.ts` con 4 puntos y con 0; `closure-finder.test.ts` "toca sin descartar cuando las dos sobrantes suman menos de 5" |
| Detección exacta a los 101 puntos | Cumple | `match.test.ts` "con 100 puntos sigue jugando y con exactamente 101 queda eliminado", además de varios jugadores cruzando el umbral en la misma ronda y el desempate |
| Cierre Clásico: una cuarta, dos ternas y un descarte | Cumple | `rules.edge-cases.test.ts`: sin cuarta, con dos cuartas, con sobrantes y sin descarte se rechazan; la cuarta en escalera se acepta |
| Escaleras con el as bajo y sin vuelta | Cumple | `hand-evaluator.test.ts` "acepta la escalera de tres con el as abajo" y "rechaza J-Q-K-A" |
| Una carta en dos combinaciones | Cumple | `rules.contract.test.ts`, que corre igual para las dos reglas |
| Un cierre inválido no altera el estado ni consume el turno | Cumple | `round.test.ts` y `declare-closure.test.ts` "tras un rechazo, el mismo jugador conserva el turno" |
| Conservación de las 52 cartas | Cumple | Prueba de propiedad con fast-check en `round.invariant.test.ts`: cualquier secuencia de jugadas |
| Partidas completas | Cumple | `match.simulation.test.ts` y `bot-match.test.ts` en Clásica, Apuntado y Ambas; `tests/e2e` por socket; Playwright en el navegador, en escritorio y en celular, con un cierre inválido rechazado |
| Persistencia y economía | Cumple | `tests/integration` sobre PostgreSQL (PGlite): migraciones, archivo de partidas, libro de fichas y doble liquidación rechazada |
| Cobertura | Cumple, verificado en CI | 95 % de líneas y 93 % de ramas en el servidor; mínimos de 90 % y 88 %, y 95 % en el dominio del juego |

Total: 333 pruebas con Vitest y una partida con Playwright, todas en el pipeline.

## Software release checklist

| Punto | Estado | Evidencia |
|---|---|---|
| Build en verde | Cumple | Pipeline `gobernanza.yml` en verde en `main` ([ejecución del 13/11](https://github.com/Dev-Mao/apuntado/actions/runs/43444494799)): tipos, lint, reglas, pruebas, cobertura, métricas, builds y Playwright |
| Scripts de base de datos ejecutados | Cumple | El servidor aplica al arrancar las migraciones pendientes (001 es el `schema.sql` del E2, de la 002 a la 005 en `apps/api/migrations`) y las registra en `migracion_aplicada`. Si una falla, el servidor no arranca y Render conserva la versión anterior. La versión actual arrancó en producción |
| Migraciones reversibles o aditivas | Cumple | Todas agregan: catálogo, un CHECK más laxo, un valor de ENUM e índices únicos. Ninguna borra datos |
| Variables de entorno configuradas | Cumple | `render.yaml`: `NODE_ENV=production`, `NODE_VERSION=22`, `SESSION_SECRET` generada por Render y `DATABASE_URL` cargada a mano desde Neon (nunca en el repositorio). Están documentadas en el README |
| Secretos fuera del repositorio | Cumple | `.env*` y `.neon` están en `.gitignore`; el repositorio es público |
| Verificación después del despliegue | Cumple | Health check de Render en `/api/health`. Pruebas de humo en producción: `health` 200, `wallet` sin sesión 401, registro con correo inválido 400 y login desconocido 401 (consulta la base) |
| Plan de vuelta atrás | Cumple | Render conserva los despliegues anteriores y permite volver a uno con un clic; como las migraciones son aditivas, la versión anterior funciona con la base nueva |
| Documentación actualizada | Cumple | README (ejecución, variables, gobernanza), plan de construcción por fase, ADR-05 y diagramas UML en `docs/entregable-3/uml` |
