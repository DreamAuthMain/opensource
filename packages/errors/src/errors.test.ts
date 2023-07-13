import { describe, expect, test } from 'vitest';

import { createErrors } from './errors.js';

describe('errors', () => {
  test('known', () => {
    const [error, ERRORS] = createErrors({
      a: 'A',
      b: 'B',
    });

    expect(ERRORS).toEqual({
      a: 'A',
      b: 'B',
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
    const [error, ERRORS] = createErrors({});
    expect(ERRORS).toEqual({});
    expect(() => error(null)).toThrowError(new Error('unknown error'));
  });
});
