import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    reporters: ['verbose'],
    restoreMocks: true,
  },
});
