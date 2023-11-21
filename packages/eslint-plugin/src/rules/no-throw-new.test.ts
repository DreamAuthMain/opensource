import { RuleTester } from '@typescript-eslint/utils/ts-eslint';
import { describe, test } from 'vitest';

import dreamauth from '../index.js';

RuleTester.describe = describe;
RuleTester.it = test;

describe('eslint', () => {
  const ruleTester = new RuleTester();

  ruleTester.run('no-throw-new', dreamauth.rules['no-throw-new'], {
    valid: ['throw error;'],
    invalid: [
      {
        code: 'throw new Error();',
        errors: [{ messageId: 'noThrowNew' }],
      },
      {
        code: 'throw Error();',
        errors: [{ messageId: 'noThrowNew' }],
      },
    ],
  });
});
