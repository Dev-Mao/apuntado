import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, ".claude/**", "e2e/**"],
    coverage: {
      provider: "v8",
      include: ["apps/api/src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.test-support.ts",
        "apps/api/src/main.ts",
        "**/ports.ts",
        "**/ports/index.ts",
        "apps/api/src/modules/game/domain/room/room.types.ts",
        "apps/api/src/modules/game/domain/session/game-session.types.ts",
        "apps/api/src/modules/game/application/events.ts",
        "apps/api/src/modules/game/application/bot/bot-strategy.ts",
        "apps/api/src/modules/identity/domain/player.ts",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 92,
        branches: 88,
        "apps/api/src/modules/game/domain/**": { lines: 95, statements: 95, functions: 95, branches: 90 },
      },
      reporter: ["text-summary", "json-summary", "html"],
      reportsDirectory: "reports/coverage",
    },
  },
});
