import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", "dist/**", "coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    rules: {
      /**
       * FF-08 · Límite de complejidad ciclomática (Entregable 2, §5.3).
       * Ningún método evaluador de combinaciones puede superar CC = 10.
       * Mantiene las funciones de evaluación atómicas y altamente testables.
       */
      complexity: ["error", { max: 10 }],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
);
