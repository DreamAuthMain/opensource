import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';

import { type JwkPair } from './jwk.js';
import { GEN_ECC_PARAMS, GEN_RSA_PARAMS } from './params.js';

type ModulusLength = 2048 | 3072 | 4096;

/**
 * JWK creation based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 * Supports algorithms for JWT signing and verifying only (not encryption).
 */
export class JwkFactory {
  readonly #crypto: PlatformCryptoResolver;

  /**
   * Create a new JWK factory.
   */
  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  /**
   * Create a new RSA signed JWK key pair.
   */
  async createRSA<A extends keyof typeof GEN_RSA_PARAMS>(
    alg: A,
    modulusLength?: ModulusLength,
  ): Promise<JwkPair<A, (typeof GEN_RSA_PARAMS)[A]['keyUsage'][0], (typeof GEN_RSA_PARAMS)[A]['keyUsage'][1]>> {
    const { keyUsage, ...params } = GEN_RSA_PARAMS[alg];
    return await this.#create(alg, { ...params, modulusLength: modulusLength ?? params.modulusLength }, keyUsage);
  }

  /**
   * Create a new Elliptic Curve signed JWK key pair.
   */
  async createECC<A extends keyof typeof GEN_ECC_PARAMS>(alg: A): Promise<JwkPair<A, 'verify', 'sign'>> {
    const params = GEN_ECC_PARAMS[alg];
    return await this.#create(alg, params, ['verify', 'sign']);
  }

  async #create<
    A extends keyof typeof GEN_RSA_PARAMS | keyof typeof GEN_ECC_PARAMS,
    U extends readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'],
  >(alg: A, params: RsaHashedKeyGenParams | EcKeyGenParams, keyUsage: U): Promise<JwkPair<A, U[0], U[1]>>;
  async #create(
    alg: string,
    params: RsaHashedKeyGenParams | EcKeyGenParams,
    keyUsage: readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'],
  ): Promise<JwkPair> {
    const crypto = await this.#crypto();
    const result = await crypto.subtle.generateKey(params, true, [...keyUsage]);
    const kid = crypto.randomUUID();
    const privateJwk = await crypto.subtle.exportKey('jwk', result.privateKey);
    const publicJwk = await crypto.subtle.exportKey('jwk', result.publicKey);

    return {
      privateKey: { alg, ...privateJwk, kid, key_ops: keyUsage },
      publicKey: { alg, ...publicJwk, kid, key_ops: keyUsage },
    };
  }
}
