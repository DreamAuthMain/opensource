import { describe, expect, test } from 'vitest';

import { PasswordFactory } from './password-factory.js';

describe('password-factory', () => {
  test('create default length', async () => {
    const factory = new PasswordFactory();
    const password = await factory.create();

    expect(password.length).toBe(32);
  });

  test('create length 64', async () => {
    const factory = new PasswordFactory();
    const password = await factory.create(64);

    expect(password.length).toBe(64);
  });
});
