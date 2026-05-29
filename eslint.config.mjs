import js from "@eslint/js";
import globals from "globals";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import jest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/commonmark",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    plugins: { jest },
    languageOptions: { globals: { ...globals.jest } },
    rules: { ...jest.configs.recommended.rules },
  },
]);
