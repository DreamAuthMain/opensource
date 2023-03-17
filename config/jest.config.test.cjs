const { defaultsESM } = require('ts-jest/presets');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...defaultsESM,
  bail: 0,
  verbose: true,
  restoreMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [`${__dirname}/jest.setup.cjs`],
  testPathIgnorePatterns: ['/node_modules/', '/\\.', '\\.d\\.ts$'],
  transformIgnorePatterns: ['/node_modules/core-js/'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.jsx?$': '$1' },
};
