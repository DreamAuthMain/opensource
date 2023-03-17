const { defaultsESM } = require('ts-jest/presets');
const coverage = require('./jest.config.coverage.cjs');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...defaultsESM,
  ...coverage,
  bail: 0,
  verbose: true,
  restoreMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [`${__dirname}/jest.setup.cjs`],
  testPathIgnorePatterns: ['/node_modules/', '\\.d\\.ts$'],
  // Remove the ESM-required .js and .jsx import extensions because they
  // confuse JEST for some reason.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.jsx?$': '$1' },
};
