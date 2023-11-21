import { type ESLint, type Linter } from 'eslint';

import noThrowNew from './rules/no-throw-new.js';

const dreamauth = {
  rules: {
    'no-throw-new': noThrowNew,
  },
} satisfies ESLint.Plugin;

const plugin = Object.assign(dreamauth, {
  configs: {
    recommended: [
      {
        files: ['**/*'],
        plugins: { dreamauth },
        rules: {
          'dreamauth/no-throw-new': ['warn'],
        },
      },
      {
        files: ['packages/errors/**/*', '**/*.test.*'],
        plugins: { dreamauth },
        rules: {
          'dreamauth/no-throw-new': ['off'],
        },
      },
    ] satisfies Linter.FlatConfig[],
  },
});

export default plugin;
