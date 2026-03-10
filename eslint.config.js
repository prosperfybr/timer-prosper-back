const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = tseslint.config(
  // Files to lint
  { files: ["src/**/*.ts"] },

  // Global ignores
  { ignores: ["dist/", "node_modules/", "coverage/", "eslint.config.js"] },

  // Base configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Custom configuration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    rules: {
      ...prettierConfig.rules,
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
