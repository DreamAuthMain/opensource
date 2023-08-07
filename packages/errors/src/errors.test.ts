import { describe, expect, test } from 'vitest';

import { createErrors } from './errors.js';

describe('errors', () => {
  test('known', () => {
    const [error, errors] = createErrors({
      a: 'A',
      b: 'B',
    });

    expect(errors).toStrictEqual({
      a: { code: 'a', message: 'A' },
      b: { code: 'b', message: 'B' },
    });

    (
      [
        ['a', 'A', new Error('cause')],
        ['b', 'B', undefined],
      ] as const
    ).forEach(([code, message, cause]) => {
      const expected = new Error(message);

      expect(() => error(code, cause)).toThrowError(expected);
      expect(() => error(code, cause)).toThrowError(expect.objectContaining({ code, cause }));
    });
  });

  test('unknown', () => {
    const [error, errors] = createErrors({});
    expect(errors).toEqual({});
    expect(() => error(null)).toThrowError(new Error('unknown error'));
  });
});
