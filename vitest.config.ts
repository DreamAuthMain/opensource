import { EventEmitter } from 'node:events';

import { defineConfig } from 'vitest/config';

EventEmitter.defaultMaxListeners = 20;

export default defineConfig({
  test: {
    passWithNoTests: true,
    reporters: ['verbose'],
    restoreMocks: true,
    coverage: {
      enabled: true,
      all: true,
      reportsDirectory: './out/coverage',
      include: ['**/*.{ts,tsx}'],
      exclude: ['**/{_*,.git*,.vscode,out,lib,dist,index*,example*,*.d.ts}', '*.*'],
      branches: 80,
      functions: 70,
      lines: 50,
      statements: 50,
    },
  },
});
