const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
    },
  },

  {
    ignores: ['node_modules/', 'referensi/', 'coverage/', 'dist/', 'build/'],
  },
  eslintConfigPrettier,
];
