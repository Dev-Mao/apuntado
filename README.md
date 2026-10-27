# Apuntado — Sistema Digital de Juego de Cartas

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
docs/adrs/            ADR-01 a ADR-05 en formato Nygard
docs/entregable-2/    Secciones redactadas del documento
models/bpmn/          Procesos As-Is y To-Be (BPMN 2.0 editable)
models/uml/           Casos de uso, componentes y clases (PlantUML y draw.io)
models/er/            Modelo entidad-relación y esquema SQL
src/modules/          Código fuente, particionado por dominio (ADR-01)
tests/architecture/   Fitness functions ejecutables (TSArch)
```

El backend se particiona **por dominio de negocio**, no por capa técnica. Cada módulo contiene
sus propias capas:

```
src/modules/
├── game/        Juego: reglas, turnos, mesa          ← el único que cambia seguido
│   ├── domain/           entidades, reglas y servicios puros
│   ├── application/      casos de uso y puertos
│   ├── infrastructure/   repositorios y adaptadores
│   └── interfaces/       capa de presentación
├── identity/    Identidad: registro, sesión, invitados
├── economy/     Economía: fichas, apuestas, movimientos
└── history/     Historial: resultados y estadísticas
```

---

## Comandos

```bash
npm install
npm test              # dominio + arquitectura
npm run test:domain   # solo pruebas del dominio
npm run test:arch     # solo fitness functions
npm run typecheck     # TypeScript estricto
npm run lint          # incluye el límite de complejidad ciclomática (CC ≤ 10)
npm run arch:deps     # reglas de dependencia (dependency-cruiser)
npm run verificar     # todo lo anterior: exactamente lo que corre el pipeline
```

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

### Las reglas están verificadas contra violaciones reales

Una prueba de arquitectura que nunca ha fallado no demuestra nada. Estas se validaron
introduciendo violaciones deliberadas y comprobando que **fallan**:

| Violación introducida | Regla que debía detectarla | Resultado |
|---|---|---|
| `classic-rule.ts` importa `apuntado-rule.ts` | FF-03 | Detectada |
| Un archivo de `game/` importa `economy/domain/chip-ledger.ts` | FF-01 | Detectada |
| `interfaces/http/` importa un repositorio de `infrastructure/` | FF-05 | Detectada |

Ese control negativo reveló un defecto real: el atajo `inFolder()` de TSArch genera un patrón que
**nunca coincide con rutas relativas**, de modo que FF-01 y FF-05 pasaban aunque estuvieran
violadas. Se reescribieron con `matchingPattern` explícito. Está documentado en el propio archivo
de pruebas.

---

## Estado actual

Esqueleto del dominio con los componentes de acoplamiento eferente cero ya implementados y
probados (`EvaluadorDeMano` y `CalculadorDePuntaje`), que es por donde recomienda empezar la
retroalimentación del Entregable 1.

```
19 pruebas  ·  13 de dominio + 6 de arquitectura
typecheck limpio  ·  ESLint limpio  ·  0 errores de dependencias
```
