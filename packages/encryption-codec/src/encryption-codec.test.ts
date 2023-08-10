import { JwkFactory } from '@dreamauth/jwk';
import { describe, expect, test } from 'vitest';

import { EncryptionCodec } from './encryption-codec.js';

describe('EncryptionCodec', () => {
  test('encrypt and decrypt', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.createRSA('RSA-OAEP-256');
    const encryption = new EncryptionCodec();
    const encrypted = await encryption.encrypt(jwk.publicKey, new TextEncoder().encode('Hello World!'));
    const decrypted = await encryption.decrypt(jwk.privateKey, encrypted);
    expect(new TextDecoder().decode(decrypted)).toBe('Hello World!');
  });
});
