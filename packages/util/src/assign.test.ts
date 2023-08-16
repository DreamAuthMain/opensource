import { expect, test } from 'vitest';

import { assign } from './assign.js';

test('assign', () => {
  const a: { a: string; b: number } = { a: '', b: 2 };
  const b: { a: number | undefined; c: boolean; d: never; e?: number } = { a: 1, c: true, d: undefined as never };
  const c: { c: number | undefined } = { c: 1 };
  const result0 = assign(undefined, a, b);
  const result1 = assign(a, b, undefined, c);
  const result2 = assign(result0, null, result1);
  const merged0: { a?: string | number | undefined; b: number; c: boolean; d?: undefined; e?: number | undefined } =
    result0;
  const merged1: {
    a?: string | number | undefined;
    b: number;
    c?: boolean | number | undefined;
    d?: undefined;
    e?: number | undefined;
  } = result1;
  const merged2: {
    a?: string | number | undefined;
    b: number;
    c?: boolean | number | undefined;
    d?: undefined;
    e?: number | undefined;
  } = result2;

  expect(merged0).toStrictEqual({
    a: 1,
    b: 2,
    c: true,
    d: undefined,
  });

  expect(merged1).toStrictEqual({
    a: 1,
    b: 2,
    c: 1,
    d: undefined,
  });

  expect(merged2).toStrictEqual({
    a: 1,
    b: 2,
    c: 1,
    d: undefined,
  });
});
