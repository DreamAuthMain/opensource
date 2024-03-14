import { randomUUID } from 'node:crypto';

import { expect, test } from 'vitest';

import { isUUID } from './is-uuid.js';

test('is-uuid', () => {
  expect(isUUID(randomUUID()))
    .toBe(true);
  expect(isUUID(randomUUID()
    .slice(1)))
    .toBe(false);
  expect(isUUID('this is not a uuid'))
    .toBe(false);
});
