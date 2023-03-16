const fs = require('node:fs');
const { globSync } = require('glob');
const { defaultsESM } = require('ts-jest/presets');

const coverageThreshold = { branches: 80, functions: 80, lines: 80, statements: 80 };
const ignorePatterns = ['/node_modules/', '/\\.', '/_', '\\.d\\.ts$'];

const packageJson = require('../package.json');
const packages = globSync(packageJson.workspaces, {
  cwd: '..',
  ignore: {
    ignored: (p) => {
      return (
        ignorePatterns.some((pat) => new RegExp(pat, 'ui').test(p.fullpath())) ||
        !fs.lstatSync(p.fullpath()).isDirectory()
      );
    },
  },
});

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...defaultsESM,
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
  moduleNameMapper: {
    // Remove the .js extension (required for ES Module support) from TS file imports.
    '^(\\.{1,2}/.*)\\.jsx?$': '$1',
  },
  // preset: 'ts-jest/presets/default-esm',
  restoreMocks: true,
  roots: ['<rootDir>'],
  setupFilesAfterEnv: [`${__dirname}/jest.setup.cjs`],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ignorePatterns,
  transformIgnorePatterns: ['/node_modules/core-js/'],
  verbose: true,
};
