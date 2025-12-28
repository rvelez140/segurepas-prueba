module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/types/**',
    '!src/interfaces/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 18,    // Actual: 18.71%
      functions: 20,   // Actual: 20.64%
      lines: 35,       // Actual: 35.58%
      statements: 34,  // Actual: 34.49%
    },
  },
  verbose: true,
  testTimeout: 10000,
};
