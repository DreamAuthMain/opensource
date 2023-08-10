import { cryptoProvider, type PartialCryptoProvider } from '@dreamauth/crypto';
import { JwkImporter } from '@dreamauth/jwk';
import { type Jwk } from '@dreamauth/types';

import { PARAMS } from './params.js';

export class EncryptionCodec {
  #crypto: PartialCryptoProvider<'importKey' | 'encrypt' | 'decrypt'>;
  #jwkImporter: JwkImporter;

  constructor(crypto: PartialCryptoProvider<'importKey' | 'encrypt' | 'decrypt'> = cryptoProvider) {
    this.#crypto = crypto;
    this.#jwkImporter = new JwkImporter(crypto);
  }

  async encrypt(publicJwk: Jwk<'RSA-OAEP-256', 'encrypt'>, data: Uint8Array): Promise<Uint8Array> {
    return await this.#apply('encrypt', publicJwk, data);
  }

  async decrypt(privateJwk: Jwk<'RSA-OAEP-256', 'decrypt'>, data: Uint8Array): Promise<Uint8Array> {
    return await this.#apply('decrypt', privateJwk, data);
  }

  async #apply<O extends 'encrypt' | 'decrypt'>(
    operation: O,
    jwk: Jwk<'RSA-OAEP-256', O>,
    data: Uint8Array,
  ): Promise<Uint8Array> {
    const crypto = await this.#crypto();
    const params = PARAMS[jwk.alg as keyof typeof PARAMS];
    const key = await this.#jwkImporter.import(jwk, operation);
    const result = await crypto.subtle[operation](params, key, data);

    return new Uint8Array(result);
  }
}
