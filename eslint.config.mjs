import js from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignorieren, damit der Lauf schnell bleibt
  {
    ignores: [
      "**/node_modules/**",
      "android/**",
      ".expo/**",
      "apk-out/**",
      "dist/**",
      "build/**"
    ],
  },

  // Basisregeln
  js.configs.recommended,

  // Projektweite Einstellungen
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Browser + Node + React-Native typische Globals
      globals: {
        ...globals.browser,
        ...globals.node,
        // Häufige RN/JSX-Globals
        fetch: "readonly",
        global: "readonly",
        __DEV__: "readonly",
        JSX: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Warnings statt Abbruchgründe
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // "no-undef": "warn", // falls du erst sachte starten willst
    },
  },
];
