import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "next-env.d.ts"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    settings: { "import/internal-regex": "^@/" },
    rules: {
      complexity: ["error", { max: 10 }],
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "import/no-default-export": "error",
      "react/no-unstable-nested-components": "error",
      "react/jsx-no-constructed-context-values": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
          pathGroups: [{ pattern: "{react,react/**,react-dom,react-dom/**,next,next/**}", group: "builtin", position: "before" }],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ["src/app/**/{page,layout,not-found}.tsx"],
    rules: { "import/no-default-export": "off" },
  },
]);
