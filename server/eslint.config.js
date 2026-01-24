import gts from 'gts';

export default [
  {
    ignores: ['build/', 'dist/', 'node_modules/', 'eslint.config.js'],
  },
  ...gts,
  // Override for JS files still using CommonJS during TS migration
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
];
