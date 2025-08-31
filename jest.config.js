/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Only pick up API tests
  testMatch: ['**/tests/**/*.test.ts'],

  // Transform TS (not TSX) and use the root tsconfig (API only)
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.json', isolatedModules: true }],
  },

  moduleFileExtensions: ['ts', 'js', 'json'],

  // Make sure nothing under client/ is touched by Jest
  testPathIgnorePatterns: ['/node_modules/', '/client/'],
  modulePathIgnorePatterns: ['/client/'],
  coveragePathIgnorePatterns: ['/client/'],

  // Don’t fail the build on TS diagnostics for tests that run
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      diagnostics: { warnOnly: true },
    },
  },
};
