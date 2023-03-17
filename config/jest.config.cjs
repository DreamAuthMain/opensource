const fs = require('node:fs');
const path = require('node:path');
const { globSync } = require('glob');

const coverageThreshold = { branches: 80, functions: 80, lines: 80, statements: 80 };
const ignorePatterns = ['/node_modules/', '/\\.', '/_', '\\.d\\.ts$'];

const packageJson = require('../package.json');
const packages = globSync(packageJson.workspaces, {
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
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!**/*.test.*'],
  coverageDirectory: '.coverage',
  coveragePathIgnorePatterns: ignorePatterns,
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'html-spa', 'lcov'],
  coverageThreshold: packages.reduce((result, dir) => ({ ...result, [dir]: coverageThreshold }), {}),
  projects: packages.flatMap((p) => {
    const rootDir = path.resolve(p);
    return [
      { displayName: 'lint', rootDir, preset: path.relative(rootDir, 'config/jest.config.lint.cjs') },
      { displayName: 'test', rootDir, preset: path.relative(rootDir, 'config/jest.config.test.cjs') },
    ];
  }),
  verbose: true,
};
