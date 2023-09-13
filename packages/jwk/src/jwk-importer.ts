import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';
import { type Jwk } from '@dreamauth/types';

import { IMPORT_PARAMS } from './params.js';

export class JwkImporter {
  #crypto: PlatformCryptoResolver;
  #cache = {
    sign: new WeakMap<Jwk, CryptoKey>(),
    verify: new WeakMap<Jwk, CryptoKey>(),
    decrypt: new WeakMap<Jwk, CryptoKey>(),
    encrypt: new WeakMap<Jwk, CryptoKey>(),
  } as const;

  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  async import(
    jwk: Jwk<keyof typeof IMPORT_PARAMS>,
    keyUsage: 'verify' | 'sign' | 'encrypt' | 'decrypt',
  ): Promise<CryptoKey> {
    let key = this.#cache[keyUsage].get(jwk);

    if (!key) {
      const crypto = await this.#crypto();
      const params = IMPORT_PARAMS[jwk.alg];

      key = await crypto.subtle.importKey('jwk', jwk as unknown as JsonWebKey, params, false, [keyUsage]);
      this.#cache[keyUsage].set(jwk, key);
    }

    return key;
  }
}
