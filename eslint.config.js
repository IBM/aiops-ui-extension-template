const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: {
      globals: { 'Atomics': 'readonly', 'SharedArrayBuffer': 'readonly' },
      parser: parser,
      parserOptions: {
        'ecmaFeatures': { 'jsx': true },
        'ecmaVersion': 2018,
        'sourceType': 'module',
        'project': './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      indent: ['error', 2, { 'SwitchCase': 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 0
    }
  }
];
