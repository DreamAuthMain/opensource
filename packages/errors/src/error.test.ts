import { describe, expect, test } from 'vitest';

import { DreamAuthError } from './error.js';

class MyError extends DreamAuthError<any> {}

describe('error', () => {
  test('has correct props', () => {
    const error = new MyError('message', 'code', { cause: 'cause', context: { foo: 'bar' } });

    expect(error)
      .toMatchObject({
        name: 'MyError',
        message: 'message',
        code: 'code',
        cause: 'cause',
        context: { foo: 'bar' },
      });
  });

  test('has correct toJSON', () => {
    const error = new MyError('message', 'code', { cause: 'cause', context: { foo: 'bar' } });

    expect(JSON.stringify(error))
      .toBe(
        JSON.stringify({
          code: error.code,
          name: error.name,
          message: error.message,
          context: error.context,
        }),
      );
  });

  test('has correct toString', () => {
    const error = new MyError('message', 'code', { cause: 'cause', context: { foo: 'bar' } });
    expect(String(error))
      .toMatchInlineSnapshot(
        '"{"code":"code","name":"MyError","message":"message","context":{"foo":"bar"}}"',
      );
  });

  test('has correct enumerable properties', () => {
    expect(Object.keys(new MyError('message', 'code')))
      .toMatchInlineSnapshot(`
      [
        "message",
        "name",
        "code",
        "context",
      ]
    `);
  });
});
