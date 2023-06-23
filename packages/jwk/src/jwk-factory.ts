import { type JwkPair, type JwkSingleton, type PartialCrypto } from '@dreamauth/types';

import { GEN_ECC_PARAMS, GEN_HMAC_PARAMS, GEN_RSA_PARAMS } from './params.js';

type ModulusLength = 2048 | 3072 | 4096;

/**
 * JWK creation based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 * Supports algorithms for JWT signing and verifying only (not encryption).
 */
export class JwkFactory {
  readonly #crypto: PartialCrypto<'randomUUID' | 'generateKey' | 'exportKey'>;

  constructor(
    crypto: PartialCrypto<'randomUUID' | 'generateKey' | 'exportKey'>,
    // alg: T,
    // modulusLength: ModulusLength = 2048,
  ) {
    this.#crypto = crypto;
  }

  async createHMAC(alg: keyof typeof GEN_HMAC_PARAMS): Promise<JwkSingleton> {
    const params = GEN_HMAC_PARAMS[alg];
    return await this.#create(alg, params, ['sign', 'verify']);
  }

  async createRSA(alg: keyof typeof GEN_RSA_PARAMS, modulusLength?: ModulusLength): Promise<JwkPair> {
    const { keyUsage, ...params } = GEN_RSA_PARAMS[alg];
    return await this.#create(alg, { ...params, modulusLength: modulusLength ?? params.modulusLength }, keyUsage);
  }

  async createECC(alg: keyof typeof GEN_ECC_PARAMS): Promise<JwkPair> {
    const params = GEN_ECC_PARAMS[alg];
    return await this.#create(alg, params, ['sign', 'verify']);
  }

  async #create<T extends HmacKeyGenParams | RsaHashedKeyGenParams | EcKeyGenParams>(
    alg: string,
    params: T,
    keyUsage: readonly ['sign', 'verify'] | readonly ['encrypt', 'decrypt'],
  ): Promise<T extends RsaHashedKeyGenParams | EcKeyGenParams ? JwkPair : JwkSingleton>;
  async #create(
    alg: string,
    params: HmacKeyGenParams | RsaHashedKeyGenParams | EcKeyGenParams,
    keyUsage: readonly ['sign', 'verify'] | readonly ['encrypt', 'decrypt'],
  ): Promise<JwkPair | JwkSingleton> {
    const result = await this.#crypto.subtle.generateKey(params, true, [...keyUsage]);
    const kid = this.#crypto.randomUUID();

    if ('privateKey' in result) {
      const privateJwk = await this.#crypto.subtle.exportKey('jwk', result.privateKey);
      const publicJwk = await this.#crypto.subtle.exportKey('jwk', result.publicKey);

      return {
        privateKey: { alg, ...privateJwk, kid },
        publicKey: { alg, ...publicJwk, kid },
      };
    }

    const jwk = await this.#crypto.subtle.exportKey('jwk', result);

    return {
      key: { alg, ...jwk, kid },
    };
  }
}
