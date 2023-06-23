import { JwkImporter } from '@dreamauth/jwk';
import { type Jwk, type PartialCrypto } from '@dreamauth/types';

import { error } from './errors.js';
import { PARAMS } from './params.js';

export class Encryption {
  #crypto: PartialCrypto<'importKey' | 'encrypt' | 'decrypt'>;
  #jwkImporter: JwkImporter;

  constructor(crypto: PartialCrypto<'importKey' | 'encrypt' | 'decrypt'>) {
    this.#crypto = crypto;
    this.#jwkImporter = new JwkImporter(crypto);
  }

  async encrypt(publicJwk: Jwk, data: Uint8Array): Promise<Uint8Array> {
    return await this.#apply('encrypt', publicJwk, data);
  }

  async decrypt(privateJwk: Jwk, data: Uint8Array): Promise<Uint8Array> {
    return await this.#apply('decrypt', privateJwk, data);
  }

  async #apply(operation: 'encrypt' | 'decrypt', jwk: Jwk, data: Uint8Array): Promise<Uint8Array> {
    if (!(jwk.alg in PARAMS)) return error('UnsupportedAlg');

    const params = PARAMS[jwk.alg as keyof typeof PARAMS];
    const key = await this.#jwkImporter.import(jwk, operation);
    const result = await this.#crypto.subtle[operation](params, key, data);

    return new Uint8Array(result);
  }
}
