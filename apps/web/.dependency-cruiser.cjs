const WEB = "^src/";

module.exports = {
  forbidden: [
    {
      name: "web-sin-ciclos",
      severity: "error",
      comment: "FF-04: la interfaz tampoco tiene dependencias cíclicas.",
      from: { path: WEB },
      to: { circular: true },
    },
    {
      name: "web-no-alcanza-el-servidor",
      severity: "error",
      comment: "FF-12: la interfaz solo conoce el servidor por los contratos; nunca su código ni la persistencia.",
      from: { path: WEB },
      to: { path: ["^\\.\\./api/", "node_modules/(pg|@electric-sql|@nestjs|@node-rs)/"] },
    },
    {
      name: "web-compartido-sin-funcionalidades",
      severity: "error",
      comment: "FF-12: components, lib y hooks están por debajo de las funcionalidades y no las importan.",
      from: { path: `${WEB}(components|lib|hooks)/` },
      to: { path: `${WEB}features/` },
    },
    {
      name: "web-funcionalidades-por-su-indice",
      severity: "error",
      comment: "FF-12: una funcionalidad usa otra solo a través de su index.ts.",
      from: { path: `${WEB}(features/[^/]+|app)/` },
      to: { path: `${WEB}features/[^/]+/`, pathNot: [`${WEB}$1/`, `${WEB}features/[^/]+/index\\.ts$`] },
    },
    {
      name: "web-socket-en-un-solo-lugar",
      severity: "error",
      comment: "FF-12: solo el cliente del socket habla Socket.IO; el resto de la interfaz recibe vistas.",
      from: { path: WEB, pathNot: `${WEB}lib/game-socket\\.ts$` },
      to: { path: "node_modules/socket\\.io-client/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "require"] },
  },
};
