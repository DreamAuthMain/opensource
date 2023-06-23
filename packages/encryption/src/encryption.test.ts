import { webcrypto } from 'node:crypto';

import { JwkFactory } from '@dreamauth/jwk';
import { describe, expect, test } from 'vitest';

import { Encryption } from './encryption.js';

describe('Encryption', () => {
  test('encrypt and decrypt', async () => {
    const jwkFactory = new JwkFactory(webcrypto);
    const jwk = await jwkFactory.createRSA('RSA-OAEP-256');
    const encryption = new Encryption(webcrypto);
    const encrypted = await encryption.encrypt(jwk.publicKey, new TextEncoder().encode('Hello World!'));
    const decrypted = await encryption.decrypt(jwk.privateKey, encrypted);
    expect(new TextDecoder().decode(decrypted)).toBe('Hello World!');
  });

  test('unsupported algorithm', async () => {
    const jwkFactory = new JwkFactory(webcrypto);
    const jwk = await jwkFactory.createRSA('RS256');
    const encryption = new Encryption(webcrypto);
    await expect(() => encryption.encrypt(jwk.publicKey, new TextEncoder().encode('Hello World!'))).rejects.toThrow(
      new Error('unsupported algorithm'),
    );
  });
});
