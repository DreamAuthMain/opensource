import { describe, expect, test } from 'vitest';

import { DreamAuthError, type DreamAuthErrorOptions } from './error.js';
import { createRaise } from './raise.js';

class MyError extends DreamAuthError<any> {
  constructor(code: 'code', options?: DreamAuthErrorOptions) {
    super('message', code, options);
  }
}

describe('createRaise', () => {
  test('works', () => {
    const raise = createRaise(MyError);

    expect(() => raise('code')).toThrowError(new MyError('code'));

    try {
      raise('code', { context: { foo: 'bar' } });
      return expect.fail();
    } catch (error) {
      expect((error as MyError).toJSON()).toMatchObject({
        name: 'MyError',
        message: 'message',
        code: 'code',
        context: { foo: 'bar' },
      });
    }
  });
});
