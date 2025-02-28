module.exports = {
  extends: ['eslint:recommended', 'airbnb-base'],
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'import/extensions': ['error', 'always']
  }
}; 