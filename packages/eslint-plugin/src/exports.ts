import { type TSESLint } from '@typescript-eslint/utils';

import { type messages } from './messages.js';
import noThrowNew from './rules/no-throw-new.js';

const dreamauth = {
  rules: {
    'no-throw-new': noThrowNew,
  } as const satisfies Record<string, TSESLint.RuleModule<keyof typeof messages>>,
};

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
    ],
  },
} as const);

export default plugin;
