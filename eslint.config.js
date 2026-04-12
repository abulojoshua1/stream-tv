import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // ── Ignored paths ────────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      '**/hls/**',
      '**/public/hls/**',
      // Service worker runs in its own browser context — not part of the app bundle
      'public/service-worker.js',
      // PM2 deployment config — not app source
      'ecosystem.config.cjs',
    ],
  },

  // ── Airbnb base (via legacy-config compat shim) ───────────────────────────
  ...compat.extends('airbnb'),

  // ── TypeScript-eslint recommended ─────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Project-wide overrides ────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },

    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // React 17+ automatic JSX transform — no React import needed
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // TypeScript handles prop types
      'react/prop-types': 'off',
      'react/require-default-props': 'off',

      // Allow both named function declarations and arrow functions
      'react/function-component-definition': ['error', {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      }],

      // TSX files are valid JSX
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],

      // Vite resolves modules; TypeScript validates imports — skip redundant checks
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',

      // Allow devDependencies in tooling config files
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: ['vite.config.*', 'eslint.config.*'],
      }],

      // Allow _ prefix for intentionally ignored params (e.g. Slider onChange)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // ── vite.config.ts — uses tsconfig.node.json, not tsconfig.app.json ────────
  // NOTE: must come after **/*.{ts,tsx} block to override parserOptions.project
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.node.json',
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },

  // ── eslint.config.js — config-file specific overrides ────────────────────
  {
    files: ['eslint.config.js'],
    rules: {
      // __dirname/__filename are valid ESM shims (fileURLToPath pattern)
      'no-underscore-dangle': ['error', { allow: ['__dirname', '__filename'] }],
      // All imports here are dev tools — they belong in devDependencies
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      // eslint.config.js is not parsed by tsc — skip resolver checks
      'import/no-unresolved': 'off',
    },
  },
];
