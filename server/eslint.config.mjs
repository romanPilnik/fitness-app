// @ts-check

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,ts}'],
    ignores: ['node_modules/**', 'dist/**', 'build/**'],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',

      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
  },

  js.configs.recommended,

  // typescript-eslint recommended configs → applied to JS & TS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{js,ts}'],
  })),

  eslintConfigPrettier,

  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      security: {},
    },

    rules: {
      // Allow require/module.exports (important for JS)
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'security/detect-object-injection': 'off',

      // Ignore unused req/res/next in Express
      'no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: 'req|res|next|_' }],

      // Style rules (Google-ish)
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': ['error', { code: 100, ignoreComments: true, ignoreUrls: true }],
    },
  },
]);
