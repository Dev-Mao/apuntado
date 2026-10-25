/**
 * Reglas de dependencia verificadas en el pipeline (`npm run arch:deps`).
 * Complementan a TSArch: aquí se vigila el grafo completo, incluidos los paquetes externos.
 */
module.exports = {
  forbidden: [
    {
      name: "sin-ciclos",
      severity: "error",
      comment: "FF-04: ninguna dependencia cíclica entre módulos.",
      from: {},
      to: { circular: true },
    },
    {
      name: "juego-no-depende-de-otros-dominios",
      severity: "error",
      comment: "FF-01/ADR-01: el módulo que más cambia no depende de los que casi no cambian.",
      from: { path: "^src/modules/game" },
      to: { path: "^src/modules/(identity|economy|history)" },
    },
    {
      name: "dominio-puro",
      severity: "error",
      comment: "FF-02/ADR-01: el dominio no conoce la web, la base de datos ni librerías externas.",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { path: "^src/modules/[^/]+/(infrastructure|interfaces)" },
    },
    {
      name: "dominio-sin-dependencias-externas",
      severity: "error",
      comment: "FF-02: el dominio se ejecuta sin red ni base de datos; por eso es testeable.",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"] },
    },
    {
      name: "reglas-independientes",
      severity: "error",
      comment: "FF-03/ADR-03: las estrategias de reglas no se conocen entre sí.",
      from: { path: "domain/rules/(classic|apuntado)-rule\\.ts$" },
      to: { path: "domain/rules/(classic|apuntado)-rule\\.ts$" },
    },
    {
      name: "presentacion-no-toca-persistencia",
      severity: "error",
      comment: "FF-05: la UI pasa siempre por un caso de uso.",
      from: { path: "^src/modules/[^/]+/interfaces" },
      to: { path: "^src/modules/[^/]+/infrastructure" },
    },
    {
      name: "shared-sin-dominio",
      severity: "error",
      comment: "FF-07: shared/ solo contiene utilidades técnicas, nunca lógica de negocio.",
      from: { path: "^src/shared" },
      to: { path: "^src/modules" },
    },
    {
      name: "sin-huerfanos",
      severity: "warn",
      comment: "Archivo que nadie importa: suele ser código muerto.",
      from: { orphan: true, pathNot: ["\\.d\\.ts$", "(^|/)index\\.ts$"] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.test\\.ts$" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require"] },
    reporterOptions: {
      dot: { collapsePattern: "^src/modules/[^/]+" },
    },
  },
};
