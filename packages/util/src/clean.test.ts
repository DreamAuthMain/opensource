import { expect, test } from 'vitest';

import { clean } from './clean.js';

test('clean', () => {
  const result = clean({ a: 1, b: undefined });
  expect(result)
    .toStrictEqual({ a: 1 });
});
