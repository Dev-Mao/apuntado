import { describe, it } from "vitest";
import { filesOfProject } from "tsarch";
import { expectNoViolations } from "./arch-helpers.js";

/**
 * Gobernanza estructural — Entregable 2, sección 5.
 * Cada prueba implementa una regla formal de gobernanza y protege una decisión de los ADRs.
 *
 * NOTA TÉCNICA: TSArch expone rutas RELATIVAS ("src/modules/game/..."), mientras que su
 * atajo `inFolder(x)` genera un patrón que exige una barra antes del primer segmento y,
 * por lo tanto, nunca coincide con una ruta relativa. Por eso se usa `matchingPattern`
 * de forma explícita. Comprobado con el control negativo documentado en docs/entregable-2.
 */
const TIMEOUT = 60_000;

/** Patrón de carpeta tolerante a rutas relativas y absolutas. */
const folder = (path: string): string => `.*${path}/.*`;
const file = (name: string): string => `.*${name}\\.ts`;

const GAME = folder("src/modules/game");
const GAME_DOMAIN = folder("src/modules/game/domain");
const GAME_APPLICATION = folder("src/modules/game/application");
const GAME_INFRA = folder("src/modules/game/infrastructure");
const GAME_INTERFACES = folder("src/modules/game/interfaces");
const GAME_ENTITIES = folder("src/modules/game/domain/entities");

describe("FF-01 · Aislamiento entre módulos de dominio (ADR-01)", () => {
  it(
    "el módulo Juego no depende de Identidad, Economía ni Historial",
    async () => {
      for (const other of ["identity", "economy", "history"]) {
        await expectNoViolations(
          filesOfProject()
            .matchingPattern(GAME)
            .shouldNot()
            .dependOnFiles()
            .matchingPattern(folder(`src/modules/${other}`)),
          `FF-01: Juego → ${other}`,
        );
      }
    },
    TIMEOUT,
  );
});

describe("FF-02 · Pureza del dominio (ADR-01)", () => {
  it(
    "el dominio no depende de infraestructura ni de la capa de interfaces",
    async () => {
      for (const [nombre, patron] of [["infraestructura", GAME_INFRA], ["interfaces", GAME_INTERFACES]] as const) {
        await expectNoViolations(
          filesOfProject().matchingPattern(GAME_DOMAIN).shouldNot().dependOnFiles().matchingPattern(patron),
          `FF-02: dominio → ${nombre}`,
        );
      }
    },
    TIMEOUT,
  );
});

describe("FF-03 · Independencia de las reglas de juego (ADR-02 / ADR-03)", () => {
  it(
    "la regla clásica y la del apuntado no se conocen entre sí",
    async () => {
      await expectNoViolations(
        filesOfProject().matchingPattern(file("classic-rule")).shouldNot().dependOnFiles().matchingPattern(file("apuntado-rule")),
        "FF-03: clásica → apuntado",
      );
      await expectNoViolations(
        filesOfProject().matchingPattern(file("apuntado-rule")).shouldNot().dependOnFiles().matchingPattern(file("classic-rule")),
        "FF-03: apuntado → clásica",
      );
    },
    TIMEOUT,
  );
});

describe("FF-04 · Ausencia de dependencias cíclicas", () => {
  it(
    "el código fuente está libre de ciclos",
    async () => {
      await expectNoViolations(
        filesOfProject().matchingPattern(folder("src")).should().beFreeOfCycles(),
        "FF-04: ciclos en src",
      );
    },
    TIMEOUT,
  );
});

describe("FF-05 · La presentación no alcanza la persistencia", () => {
  it(
    "la capa de interfaces no depende de repositorios ni de entidades de dominio",
    async () => {
      for (const [nombre, patron] of [["infraestructura", GAME_INFRA], ["entidades", GAME_ENTITIES]] as const) {
        await expectNoViolations(
          filesOfProject().matchingPattern(GAME_INTERFACES).shouldNot().dependOnFiles().matchingPattern(patron),
          `FF-05: interfaces → ${nombre}`,
        );
      }
    },
    TIMEOUT,
  );
});

describe("FF-06 · El orquestador no absorbe lógica de reglas", () => {
  it(
    "los casos de uso no dependen de implementaciones concretas de reglas",
    async () => {
      for (const concrete of ["classic-rule", "apuntado-rule"]) {
        await expectNoViolations(
          filesOfProject().matchingPattern(GAME_APPLICATION).shouldNot().dependOnFiles().matchingPattern(file(concrete)),
          `FF-06: aplicación → ${concrete}`,
        );
      }
    },
    TIMEOUT,
  );
});
