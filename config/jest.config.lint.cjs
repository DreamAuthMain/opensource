/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  runner: 'jest-runner-eslint',
  testMatch: ['<rootDir>/src/**/*.{ts,tsx}', '!**/*.test.*'],
};
