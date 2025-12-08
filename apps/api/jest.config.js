module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['./tests/setup.ts'],

    // Configuración de cobertura de código
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.interface.ts',
      '!src/types/**',
      '!src/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

    // Umbrales de cobertura mínimos
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },

    // Configuración adicional
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Timeout para pruebas asíncronas
    testTimeout: 10000,

    // Rutas a ignorar
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/'],
  };