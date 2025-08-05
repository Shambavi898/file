/**
 * Offline-First Productivity Suite - ESLint Configuration
 * Enforces best practices for scalable, offline-first applications
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    serviceworker: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/strict',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'unicorn'
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/no-explicit-any': 'warn',

    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/self-closing-comp': 'error',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.jsx', '.tsx'] }
    ],

    // Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/no-autofocus': 'off',

    // Code Quality
    'unicorn/prefer-query-selector': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always'
      }
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-var': 'error',
    'prefer-const': 'error',

    // Error Handling
    'no-unused-expressions': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {}
    }
  },
  overrides: [
    {
      files: ['service-worker.js'],
      env: {
        serviceworker: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-restricted-globals': ['error', 'event'],
        'no-console': ['error', { allow: ['warn', 'error'] }]
      }
    },
    {
      files: ['**/storage/**/*.ts', '**/storage/**/*.tsx'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'MemberExpression[object.name="localStorage"]',
            message: 'Use IndexedDB for offline storage'
          },
          {
            selector: 'MemberExpression[object.name="sessionStorage"]',
            message: 'Use IndexedDB for offline storage'
          }
        ]
      }
    }
  ],
  globals: {
    indexedDB: 'readonly',
    IDBRequest: 'readonly',
    IDBTransaction: 'readonly',
    IDBCursor: 'readonly',
    navigator: 'readonly'
  }
};