import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginSecurity from "eslint-plugin-security";

export default [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
    ],
  },

  // Base config for all JS files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,

      // Customize rules for Node.js/Express
      "no-console": "off", // Console is fine in Node.js
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_|next|req|res|err",
          varsIgnorePattern: "^_",
        },
      ],
      "no-param-reassign": [
        "error",
        {
          props: false, // Allow param reassignment (common in Express middleware)
        },
      ],
    },
  },

  // Prettier must be last to override formatting rules
  eslintConfigPrettier,
];
