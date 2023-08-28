import { RuleTester } from '@typescript-eslint/utils/ts-eslint';
import { beforeEach, describe, test } from 'vitest';

import { rules } from '../exports.js';

RuleTester.describe = describe;
RuleTester.it = test;

describe('eslint', () => {
  const ruleTester = new RuleTester();

  ruleTester.run('no-throw-new', rules['no-throw-new'], {
    valid: ['throw error;'],
    invalid: [
      {
        code: 'throw new Error("");',
        errors: [{ messageId: 'noThrowNew' }],
      },
    ],
  });
});
