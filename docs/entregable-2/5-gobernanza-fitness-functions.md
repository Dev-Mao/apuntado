# Entregable 2. Sección 5: Gobernanza y funciones de idoneidad
**Peso en la rúbrica: 15%**

## 5.1 Reglas de gobernanza estructural y modularidad

Las decisiones de los ADR no se sostienen con disciplina, sino con pruebas que fallan la
construcción. Se definen ocho reglas formales, cada una ligada a la decisión que protege.

| # | Regla de gobernanza | Protege | Herramienta |
|---|---|---|---|
| **FF-01** | El módulo Juego no depende de Identidad, Economía ni Historial | ADR-01, ADR-05 | TSArch · dependency-cruiser |
| **FF-02** | El dominio no depende de infraestructura, interfaces ni librerías externas | ADR-01, ADR-04 | TSArch · dependency-cruiser |
| **FF-03** | `ReglaClasica` y `ReglaApuntado` no se conocen entre sí | ADR-02, ADR-03 | TSArch · dependency-cruiser |
| **FF-04** | No existen dependencias cíclicas en el código fuente | ADR-01, ADR-05 | TSArch · dependency-cruiser |
| **FF-05** | La capa de presentación no alcanza la persistencia ni las entidades de dominio | ADR-01 | TSArch · dependency-cruiser |
| **FF-06** | Los casos de uso no dependen de implementaciones concretas de reglas | ADR-03, riesgo R-04 | TSArch |
| **FF-07** | `shared/` contiene solo utilidades técnicas, nunca lógica de negocio | ADR-01 | dependency-cruiser |
| **FF-08** | Ninguna función supera complejidad ciclomática 10 | §5.3 de la guía, riesgo R-01 | ESLint |

Las tres reglas que la guía exige explícitamente están cubiertas: **aislamiento de capas** (FF-02 y
FF-05), **independencia de las reglas de juego y ausencia de ciclos** (FF-03 y FF-04) y **límite de
complejidad ciclomática** (FF-08).

FF-06 no estaba en el Entregable 1. Surgió de la retroalimentación del profesor, que advirtió que
durante la codificación es tentador resolver problemas de integración agregando validaciones al
orquestador. Convertirla en una prueba automática es lo que impide que el riesgo R-04 dependa de
la memoria del equipo.

## 5.2 Código fuente de las fitness functions

Implementadas con **TSArch** sobre **Vitest**, conforme al stack TypeScript del proyecto. Código
completo en `tests/architecture/modularity.arch.test.ts`.

```typescript
import { describe, it } from "vitest";
import { filesOfProject } from "tsarch";
import { expectNoViolations } from "./arch-helpers.js";

const folder = (path: string): string => `.*${path}/.*`;
const file   = (name: string): string => `.*${name}\\.ts`;

const GAME            = folder("src/modules/game");
const GAME_DOMAIN     = folder("src/modules/game/domain");
const GAME_APPLICATION = folder("src/modules/game/application");
const GAME_INTERFACES = folder("src/modules/game/interfaces");
const GAME_INFRA      = folder("src/modules/game/infrastructure");

describe("FF-01 · Aislamiento entre módulos de dominio (ADR-01)", () => {
  it("el módulo Juego no depende de Identidad, Economía ni Historial", async () => {
    for (const other of ["identity", "economy", "history"]) {
      await expectNoViolations(
        filesOfProject().matchingPattern(GAME)
          .shouldNot().dependOnFiles().matchingPattern(folder(`src/modules/${other}`)),
        `FF-01: Juego → ${other}`,
      );
    }
  }, 60_000);
});

describe("FF-03 · Independencia de las reglas de juego (ADR-03)", () => {
  it("la regla clásica y la del apuntado no se conocen entre sí", async () => {
    await expectNoViolations(
      filesOfProject().matchingPattern(file("classic-rule"))
        .shouldNot().dependOnFiles().matchingPattern(file("apuntado-rule")),
      "FF-03: clásica → apuntado",
    );
    await expectNoViolations(
      filesOfProject().matchingPattern(file("apuntado-rule"))
        .shouldNot().dependOnFiles().matchingPattern(file("classic-rule")),
      "FF-03: apuntado → clásica",
    );
  }, 60_000);
});

describe("FF-04 · Ausencia de dependencias cíclicas", () => {
  it("el código fuente está libre de ciclos", async () => {
    await expectNoViolations(
      filesOfProject().matchingPattern(folder("src")).should().beFreeOfCycles(),
      "FF-04: ciclos en src",
    );
  }, 60_000);
});

describe("FF-06 · El orquestador no absorbe lógica de reglas", () => {
  it("los casos de uso no dependen de implementaciones concretas", async () => {
    for (const concrete of ["classic-rule", "apuntado-rule"]) {
      await expectNoViolations(
        filesOfProject().matchingPattern(GAME_APPLICATION)
          .shouldNot().dependOnFiles().matchingPattern(file(concrete)),
        `FF-06: aplicación → ${concrete}`,
      );
    }
  }, 60_000);
});
```

Las reglas FF-01 a FF-05 y FF-07 se duplican en `dependency-cruiser`, que analiza el grafo
completo incluyendo las dependencias externas:

```javascript
module.exports = {
  forbidden: [
    { name: "sin-ciclos", severity: "error",
      from: {}, to: { circular: true } },
    { name: "juego-no-depende-de-otros-dominios", severity: "error",
      from: { path: "^src/modules/game" },
      to:   { path: "^src/modules/(identity|economy|history)" } },
    { name: "dominio-sin-dependencias-externas", severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to:   { dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"] } },
    { name: "reglas-independientes", severity: "error",
      from: { path: "domain/rules/(classic|apuntado)-rule\\.ts$" },
      to:   { path: "domain/rules/(classic|apuntado)-rule\\.ts$" } },
  ],
};
```

### Validación de las reglas mediante control negativo

Una prueba de arquitectura que nunca ha fallado no demuestra nada. Antes de darlas por buenas se
introdujeron violaciones deliberadas en el código y se verificó que las reglas las detectaran:

| Violación introducida | Regla que debía detectarla | Resultado |
|---|---|---|
| `classic-rule.ts` importa `apuntado-rule.ts` | FF-03 | Detectada |
| Un archivo de `game/` importa `economy/domain/chip-ledger.ts` | FF-01 | Detectada |
| `interfaces/http/` importa un repositorio de `infrastructure/` | FF-05 | Detectada |

El ejercicio reveló un defecto en la primera versión de las pruebas. El atajo `inFolder(x)` de
TSArch genera un patrón que exige una barra antes del primer segmento, mientras que TSArch expone
rutas relativas del tipo `src/modules/game/...`. Por eso las reglas FF-01 y FF-05 pasaban aunque
estuvieran violadas. Se reescribieron con `matchingPattern` explícito y desde entonces detectan
las tres violaciones.

Sin el control negativo, el proyecto habría entregado tres reglas de gobernanza de las cuales dos
no verificaban nada.

## 5.3 Límites de complejidad ciclomática y reglas de dependencias

La complejidad ciclomática se controla con la regla `complexity` de **ESLint**, integrada al
pipeline (`eslint.config.js`):

```javascript
rules: {
  // FF-08: ningún método evaluador de combinaciones puede superar CC = 10
  complexity: ["error", { max: 10 }],
  "max-depth": ["error", 3],
  "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
}
```

El límite apunta sobre todo a `EvaluadorDeMano`, donde se concentra la lógica combinatoria y el
riesgo R-01. Funciones como `isRun`, `isSet` e `isQuad` se mantienen por debajo del umbral
precisamente porque cada una verifica una sola estructura. Una única función
`validarCombinacion` con ramas para terna, cuarta y secuencia superaría el límite y la regla la
rechazaría, de modo que el umbral empuja hacia el mismo diseño que pide la responsabilidad
atómica.

### Pipeline de gobernanza

```bash
npm run verificar   # = typecheck + lint + arch:deps + test:arch + test:domain
```

| Etapa | Qué verifica | Falla si |
|---|---|---|
| `npm run typecheck` | Tipos de TypeScript en modo estricto | El código no compila |
| `npm run lint` | FF-08, profundidad y tamaño de funciones | Alguna función supera CC = 10 |
| `npm run arch:deps` | FF-01 a FF-05 y FF-07 sobre el grafo completo | Hay una dependencia prohibida o un ciclo |
| `npm run test:arch` | FF-01 a FF-06 como pruebas | Alguna regla encuentra violaciones |
| `npm run test:domain` | Pruebas unitarias del dominio | Alguna prueba falla |

Estas cinco etapas se ejecutan de forma automática en cada subida y en cada solicitud de
integración mediante un flujo de GitHub Actions (`.github/workflows/gobernanza.yml`), de modo que
una violación de arquitectura marca la construcción en rojo desde la primera integración. Se
comprobó que el flujo falla ante una violación deliberada: al importar `economy` desde `game`,
`dependency-cruiser` reporta el error y el comando termina con código de salida 1.

### Estado actual de la verificación

```
19 pruebas en verde   13 de dominio + 6 de arquitectura
typecheck limpio      ESLint limpio (CC ≤ 10)
dependency-cruiser    0 errores · 17 módulos · 21 dependencias analizadas
```

