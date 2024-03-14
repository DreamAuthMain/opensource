import { webcrypto } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PasswordHashFactory } from './password-hash-factory.js';

describe('PasswordHashFactory', () => {
  beforeEach(() => {
    vi.spyOn(webcrypto, 'getRandomValues')
      .mockImplementation((array: any) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i;
        }

        return array;
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Argon2id with new salt', async () => {
    const factory = new PasswordHashFactory(async () => webcrypto);
    const [hash, params] = await factory.create('password', {
      t: 'argon2id',
      i: 3,
      l: 32,
      p: 4,
      m: 64,
    });

    expect(webcrypto.getRandomValues)
      .toHaveBeenCalledTimes(1);
    expect(hash)
      .toBe('kuD-wTMeWb0QFOj4zF2hmydpl14gBEQFrP5Tb5A6SmE');
    expect(params)
      .toMatchObject({
        t: 'argon2id',
        i: 3,
        l: 32,
        p: 4,
        m: 64,
        s: 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-Pw',
      });
  });

  test('Argon2id with existing salt', async () => {
    const factory = new PasswordHashFactory(async () => webcrypto);
    const salt = '0o8shEpPoXnx5OU1xF5j/1kXQxD3IWlaPaPQYp/YvG24/T0y7LyV1i5Oe3o1zGGWYtiOzL/+n3XXsEVazfO4YA==';
    const [hash, params] = await factory.create('password', {
      t: 'argon2id',
      i: 3,
      l: 32,
      p: 4,
      m: 64,
      s: salt,
    });

    expect(webcrypto.getRandomValues)
      .toHaveBeenCalledTimes(0);
    expect(hash)
      .toBe('XJMVbVuDc4eDaXatbxzhqwdc6VF0nRSNnPgIxJrjTKs');
    expect(params)
      .toMatchObject({
        t: 'argon2id',
        i: 3,
        l: 32,
        p: 4,
        m: 64,
        s: '0o8shEpPoXnx5OU1xF5j_1kXQxD3IWlaPaPQYp_YvG24_T0y7LyV1i5Oe3o1zGGWYtiOzL_-n3XXsEVazfO4YA',
      });
  });

  test('PBKDF2 with new salt', async () => {
    const factory = new PasswordHashFactory(async () => webcrypto);
    const [hash, params] = await factory.create('password', {
      t: 'pbkdf2',
      i: 3,
      l: 32,
      h: 'SHA-256',
    });

    expect(webcrypto.getRandomValues)
      .toHaveBeenCalledTimes(1);
    expect(hash)
      .toBe('gVmjLfavwt0LdMkJXyWmvx5EKFaQDL-pC5s3cE9RmcM');
    expect(params)
      .toMatchObject({
        t: 'pbkdf2',
        i: 3,
        l: 32,
        h: 'SHA-256',
        s: 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-Pw',
      });
  });

  test('PBKDF2 with existing salt', async () => {
    const factory = new PasswordHashFactory(async () => webcrypto);
    const salt = '0o8shEpPoXnx5OU1xF5j/1kXQxD3IWlaPaPQYp/YvG24/T0y7LyV1i5Oe3o1zGGWYtiOzL/+n3XXsEVazfO4YA==';
    const [hash, params] = await factory.create('password', {
      t: 'pbkdf2',
      i: 3,
      l: 32,
      h: 'SHA-256',
      s: salt,
    });

    expect(webcrypto.getRandomValues)
      .toHaveBeenCalledTimes(0);
    expect(hash)
      .toBe('2cXPincFEspDci6EYMaWVYWSn-1rglqG1hvZoY4vpoc');
    expect(params)
      .toMatchObject({
        t: 'pbkdf2',
        i: 3,
        l: 32,
        h: 'SHA-256',
        s: '0o8shEpPoXnx5OU1xF5j_1kXQxD3IWlaPaPQYp_YvG24_T0y7LyV1i5Oe3o1zGGWYtiOzL_-n3XXsEVazfO4YA',
      });
  });
});
