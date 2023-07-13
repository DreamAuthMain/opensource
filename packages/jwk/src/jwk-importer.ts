import { type Jwk, type PartialCrypto } from '@dreamauth/types';

import { IMPORT_PARAMS } from './params.js';

export class JwkImporter {
  #crypto: PartialCrypto<'importKey'>['subtle'];
  #cache = {
    sign: new WeakMap<Jwk, CryptoKey>(),
    verify: new WeakMap<Jwk, CryptoKey>(),
    decrypt: new WeakMap<Jwk, CryptoKey>(),
    encrypt: new WeakMap<Jwk, CryptoKey>(),
  } as const;

  constructor(crypto: PartialCrypto<'importKey'>) {
    this.#crypto = crypto.subtle;
  }

  async import(
    jwk: Jwk<keyof typeof IMPORT_PARAMS>,
    keyUsage: 'verify' | 'sign' | 'encrypt' | 'decrypt',
  ): Promise<CryptoKey> {
    let key = this.#cache[keyUsage].get(jwk);

    if (!key) {
      const params = IMPORT_PARAMS[jwk.alg];

      key = await this.#crypto.importKey('jwk', jwk as unknown as JsonWebKey, params, false, [keyUsage]);
      this.#cache[keyUsage].set(jwk, key);
    }

    return key;
  }
}
