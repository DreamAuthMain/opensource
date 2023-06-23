import { type Jwk, type PartialCrypto } from '@dreamauth/types';

import { error } from './errors.js';
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

  async import(jwk: Jwk, keyUsage: 'sign' | 'verify' | 'decrypt' | 'encrypt'): Promise<CryptoKey> {
    let key = this.#cache[keyUsage].get(jwk);

    if (!key) {
      if (!(jwk.alg in IMPORT_PARAMS)) throw error('UnsupportedAlg');

      const params = IMPORT_PARAMS[jwk.alg as keyof typeof IMPORT_PARAMS];

      key = await this.#crypto.importKey('jwk', jwk, params, false, [keyUsage]);
      this.#cache[keyUsage].set(jwk, key);
    }

    return key;
  }
}
