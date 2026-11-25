import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // _legacy: andamios sin montar ni filtro de sede; no se lintean ni se montan.
    ignores: ['src/generated/**', 'src/_legacy/**'],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // ajustar según hallazgos reales de pnpm lint
    },
  },
];