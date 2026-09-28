import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Aturan lapisan (docs/03-arsitektur.md).
 * Arah ketergantungan: features → application → domain ← infrastructure; app merakit semuanya.
 */
const layer = (type) => ({ element: { type } });
const layers = (...types) => ({ element: { types: { anyOf: types } } });

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'playwright-report', 'test-results'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'application', pattern: 'src/application' },
        { type: 'domain', pattern: 'src/domain' },
        { type: 'infrastructure', pattern: 'src/infrastructure' },
        { type: 'shared', pattern: 'src/shared' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: layer('app'),
              allow: {
                to: layers('app', 'features', 'application', 'domain', 'infrastructure', 'shared'),
              },
            },
            { from: layer('features'), allow: { to: layers('application', 'domain', 'shared') } },
            { from: layer('application'), allow: { to: layers('application', 'domain') } },
            { from: layer('infrastructure'), allow: { to: layers('infrastructure', 'domain') } },
            { from: layer('domain'), allow: { to: layer('domain') } },
            { from: layer('shared'), allow: { to: layer('shared') } },
          ],
        },
      ],
    },
  },

  {
    files: ['src/domain/**/*.ts'],
    ignores: ['src/domain/**/*.test.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Domain harus murni. Simpan data lewat repository.' },
        { name: 'fetch', message: 'Domain harus murni.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Gunakan Clock yang disuntikkan, bukan Date.now().',
        },
      ],
    },
  },

  {
    files: ['*.{js,ts}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  prettier,
);
