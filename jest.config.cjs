const { globSync } = require('glob');

const packageJson = require('./package.json');
const packages = globSync(packageJson.workspaces, { ignore: '**/node_modules/**' });
const ignorePatterns = ['/node_modules/', '/\\.', '/_', '\\.d\\.ts$'];
const coverageThreshold = { branches: 80, functions: 80, lines: 80, statements: 80 };

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  bail: 0,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{ts,tsx}'],
  coverageDirectory: '.coverage',
  coveragePathIgnorePatterns: ignorePatterns,
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'html-spa', 'lcov'],
  coverageThreshold: {
    global: coverageThreshold,
    ...packages.reduce((result, dir) => ({ ...result, [dir]: coverageThreshold }), {}),
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    // Remove the .js extension (required for ES Module support) from TS file imports.
    '^(\\.{1,2}/.*)\\.jsx?$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  restoreMocks: true,
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ignorePatterns,
  transformIgnorePatterns: ['/node_modules/core-js/'],
  verbose: true,
};
