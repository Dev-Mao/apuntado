import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", "dist/**", "coverage/**", ".claude/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/*/src/**/*.ts", "packages/*/src/**/*.ts", "tests/**/*.ts"],
    rules: {
      complexity: ["error", { max: 10 }],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
);
