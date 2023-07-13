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

  constructor(crypto: PartialCrypto<'randomUUID' | 'generateKey' | 'exportKey'>) {
    this.#crypto = crypto;
  }

  async createHMAC<A extends keyof typeof GEN_HMAC_PARAMS>(alg: A): Promise<JwkSingleton<A, 'verify' | 'sign'>> {
    const params = GEN_HMAC_PARAMS[alg];
    const pair = await this.#create(alg, params, ['verify', 'sign']);
    return pair;
  }

  async createRSA<A extends keyof typeof GEN_RSA_PARAMS>(
    alg: A,
    modulusLength?: ModulusLength,
  ): Promise<JwkPair<A, (typeof GEN_RSA_PARAMS)[A]['keyUsage'][0], (typeof GEN_RSA_PARAMS)[A]['keyUsage'][1]>> {
    const { keyUsage, ...params } = GEN_RSA_PARAMS[alg];
    return await this.#create(alg, { ...params, modulusLength: modulusLength ?? params.modulusLength }, keyUsage);
  }

  async createECC<A extends keyof typeof GEN_ECC_PARAMS>(alg: A): Promise<JwkPair<A, 'verify', 'sign'>> {
    const params = GEN_ECC_PARAMS[alg];
    return await this.#create(alg, params, ['verify', 'sign']);
  }

  async #create<
    A extends keyof typeof GEN_RSA_PARAMS | keyof typeof GEN_ECC_PARAMS,
    U extends readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'],
  >(alg: A, params: RsaHashedKeyGenParams | EcKeyGenParams, keyUsage: U): Promise<JwkPair<A, U[0], U[1]>>;
  async #create<A extends keyof typeof GEN_HMAC_PARAMS>(
    alg: A,
    params: HmacKeyGenParams,
    keyUsage: readonly ['verify', 'sign'],
  ): Promise<JwkSingleton<A, 'sign' | 'verify'>>;
  async #create(
    alg: string,
    params: HmacKeyGenParams | RsaHashedKeyGenParams | EcKeyGenParams,
    keyUsage: readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'],
  ): Promise<JwkPair | JwkSingleton> {
    const result = await this.#crypto.subtle.generateKey(params, true, [...keyUsage]);
    const kid = this.#crypto.randomUUID();

    if ('privateKey' in result) {
      const privateJwk = await this.#crypto.subtle.exportKey('jwk', result.privateKey);
      const publicJwk = await this.#crypto.subtle.exportKey('jwk', result.publicKey);

      return {
        privateKey: { alg, ...privateJwk, kid, key_ops: keyUsage },
        publicKey: { alg, ...publicJwk, kid, key_ops: keyUsage },
      };
    }

    const jwk = await this.#crypto.subtle.exportKey('jwk', result);

    return {
      key: { alg, ...jwk, kid, key_ops: keyUsage },
    };
  }
}
