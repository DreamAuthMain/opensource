export type JwkAlgorithm = keyof typeof algorithms;
export type JwkRsaModulusLength = 2048 | 4096;

export interface Jwk extends JsonWebKey {
  readonly kid: string;
  readonly alg: string;
}

export interface JwkPair {
  readonly privateKey: Jwk;
  readonly publicKey: Jwk;
}

export interface JwkSingleton {
  readonly privateKey: Jwk;
  readonly publicKey?: undefined;
}

export interface JwkFactoryOptions<T extends JwkAlgorithm> {
  readonly algorithm?: T;
  readonly modulusLength?: JwkRsaModulusLength;
  readonly crypto?: Pick<Crypto, 'randomUUID'> & { subtle: Pick<SubtleCrypto, 'generateKey' | 'exportKey'> };
}

const GLOBAL_CRYPTO = crypto;

const algorithms = {
  HS256: { params: { name: 'HMAC', hash: 'SHA-256', length: 256 } },
  HS384: { params: { name: 'HMAC', hash: 'SHA-384', length: 384 } },
  HS512: { params: { name: 'HMAC', hash: 'SHA-512', length: 512 } },
  RS256: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } },
  RS384: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' } },
  RS512: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' } },
  PS256: { params: { name: 'RSA-PSS', hash: 'SHA-256' } },
  PS384: { params: { name: 'RSA-PSS', hash: 'SHA-384' } },
  PS512: { params: { name: 'RSA-PSS', hash: 'SHA-512' } },
  ES256: { params: { name: 'ECDSA', namedCurve: 'P-256' } },
  ES384: { params: { name: 'ECDSA', namedCurve: 'P-384' } },
  ES512: { params: { name: 'ECDSA', namedCurve: 'P-521' } },
} as const satisfies Record<
  string,
  {
    params:
      | ({ name: 'HMAC' } & HmacKeyGenParams)
      | ({ name: 'RSASSA-PKCS1-v1_5' | 'RSA-PSS' } & Omit<RsaHashedKeyGenParams, 'modulusLength' | 'publicExponent'>)
      | ({ name: 'ECDSA' | 'ECDH-ES' } & EcKeyGenParams);
  }
>;

/**
 * JWK creation based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 * Supports algorithms for JWT signing and verifying only (not
 * encryption).
 */
export class JwkFactory<T extends JwkAlgorithm = 'RS256'> {
  readonly #algorithm: JwkAlgorithm;
  readonly #modulusLength: JwkRsaModulusLength;
  readonly #crypto: Pick<Crypto, 'randomUUID'> & { subtle: Pick<SubtleCrypto, 'generateKey' | 'exportKey'> };

  constructor({ algorithm = 'RS256' as T, modulusLength = 2048, crypto = GLOBAL_CRYPTO }: JwkFactoryOptions<T> = {}) {
    this.#algorithm = algorithm;
    this.#modulusLength = modulusLength;
    this.#crypto = crypto;
  }

  async create<T0 extends JwkAlgorithm = T>({
    algorithm = this.#algorithm as T0,
    modulusLength = this.#modulusLength,
  }: Omit<JwkFactoryOptions<T0>, 'crypto'> = {}): Promise<T0 extends `HS${string}` ? JwkSingleton : JwkPair> {
    const kid = `${this.#crypto.randomUUID()}-${Date.now().toString(16)}`;
    const { params } = algorithms[algorithm];
    const result = await this.#crypto.subtle.generateKey(
      { ...params, modulusLength, publicExponent: new Uint8Array([0x01, 0x00, 0x01]) } as
        | HmacKeyGenParams
        | RsaHashedKeyGenParams
        | EcKeyGenParams,
      true,
      ['sign', 'verify'],
    );

    if ('privateKey' in result) {
      const privateData = await this.#crypto.subtle.exportKey('jwk', result.privateKey);
      const publicData = await this.#crypto.subtle.exportKey('jwk', result.publicKey);
      const alg = privateData.alg ?? publicData.alg ?? algorithm;

      return {
        privateKey: { ...privateData, kid, alg },
        publicKey: { ...publicData, kid, alg },
      } satisfies JwkPair as JwkSingleton & JwkPair;
    }

    const privateData = await this.#crypto.subtle.exportKey('jwk', result);
    /* c8 ignore next */
    const alg = privateData.alg ?? algorithm;

    return { privateKey: { ...privateData, kid, alg } } satisfies JwkSingleton as JwkSingleton & JwkPair;
  }
}
