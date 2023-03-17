const fs = require('node:fs');
const path = require('node:path');
const { globSync } = require('glob');
const coverage = require('./jest.config.coverage.cjs');

const packageJson = require('../package.json');
const packages = globSync(packageJson.workspaces, {
  ignore: { ignored: (p) => p.name.startsWith('_') || !fs.lstatSync(p.fullpath()).isDirectory() },
});

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...coverage,
  coverageThreshold: {
    ...coverage.coverageThreshold,
    ...packages.reduce((result, rootDir) => ({ ...result, [rootDir]: coverage.coverageThreshold.global }), {}),
  },
  projects: packages.flatMap((rootDir) => {
    rootDir = path.resolve(rootDir);
    return [
      { displayName: 'test', rootDir, preset: path.relative(rootDir, 'config/jest.config.test.cjs') },
      { displayName: 'lint', rootDir, preset: path.relative(rootDir, 'config/jest.config.lint.cjs') },
    ];
  }),
  verbose: true,
};
