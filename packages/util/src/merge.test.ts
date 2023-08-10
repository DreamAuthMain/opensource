import { expect, test } from 'vitest';

import { merge } from './merge.js';

test('merge', () => {
  const a: { a: string; b: number } = { a: '', b: 2 };
  const b: { a: number | undefined; c: boolean; d: never; e?: number } = { a: 1, c: true, d: undefined as never };
  const c: { c: number | undefined } = { c: 1 };
  const result0 = merge(undefined, a, b);
  const result1 = merge(a, b, c, undefined);
  const result2 = merge(result0, result1);
  const merged0: { a: string | number; b: number; c: boolean; d?: undefined; e?: number | undefined } = result0;
  const merged1: { a: string | number; b: number; c: boolean | number; d?: undefined; e?: number | undefined } =
    result1;
  const merged2: { a: string | number; b: number; c: boolean | number; d?: undefined; e?: number | undefined } =
    result2;

  expect(merged0).toStrictEqual({
    a: 1,
    b: 2,
    c: true,
  });

  expect(merged1).toStrictEqual({
    a: 1,
    b: 2,
    c: 1,
  });

  expect(merged2).toStrictEqual({
    a: 1,
    b: 2,
    c: 1,
  });
});
