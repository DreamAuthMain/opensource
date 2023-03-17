/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!**/*.test.*'],
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'html', 'lcov'],
  coverageDirectory: '<rootDir>/out/coverage',
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
};
