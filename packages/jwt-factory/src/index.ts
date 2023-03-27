import { base64UrlEncode } from '@dreamauth/base64url-encode';

interface JsonObject {
  readonly [key: string]:
    | JsonObject
    | readonly (JsonObject | undefined)[]
    | string
    | number
    | boolean
    | null
    | undefined;
}

export type JwkAlgorithm = keyof typeof algorithms;

export interface Jwk extends JsonWebKey {
  readonly alg: string;
  readonly kid?: string;
}

export interface JwkLoader {
  load(): Promise<Jwk>;
}

export interface JwtHeaderOptions extends JsonObject {
  readonly typ?: never;
  readonly alg?: never;
  readonly kid?: string;
}

export interface JwtHeader extends Omit<JwtHeaderOptions, 'typ' | 'alg'> {
  readonly typ: 'JWT';
  readonly alg: JwkAlgorithm;
}

export interface JwtPayloadOptions extends JsonObject {
  readonly jti?: string;
  readonly iat?: number;
  readonly exp?: number;
  readonly nbf?: number;
  readonly iss?: string;
  readonly sub?: string;
  readonly aud?: string;
}

export interface JwtPayload extends JwtPayloadOptions {
  readonly jti: string;
  readonly iat: number;
  readonly exp: number;
}

export interface JwtFactoryOptions {
  readonly jwkLoader: JwkLoader;
  readonly header?: JwtHeaderOptions;
  readonly payload?: JwtPayloadOptions;
  readonly lifetime?: number;
  readonly crypto?: Pick<Crypto, 'randomUUID'> & { subtle: Pick<SubtleCrypto, 'importKey' | 'sign'> };
}

export interface Jwt {
  readonly value: string;
  readonly header: JwtHeader;
  readonly payload: JwtPayload;
  readonly signature: string;
}

const GLOBAL_CRYPTO = crypto;
const SECONDS_PER_MINUTE = 60;

const algorithms = {
  HS256: { params: { name: 'HMAC', hash: 'SHA-256' } },
  HS384: { params: { name: 'HMAC', hash: 'SHA-384' } },
  HS512: { params: { name: 'HMAC', hash: 'SHA-512' } },
  RS256: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } },
  RS384: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' } },
  RS512: { params: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' } },
  PS256: { params: { name: 'RSA-PSS', hash: 'SHA-256', saltLength: 32 } },
  PS384: { params: { name: 'RSA-PSS', hash: 'SHA-384', saltLength: 48 } },
  PS512: { params: { name: 'RSA-PSS', hash: 'SHA-512', saltLength: 64 } },
  ES256: { params: { name: 'ECDSA', hash: 'SHA-256', namedCurve: 'P-256' } },
  ES384: { params: { name: 'ECDSA', hash: 'SHA-384', namedCurve: 'P-384' } },
  ES512: { params: { name: 'ECDSA', hash: 'SHA-512', namedCurve: 'P-521' } },
} as const satisfies Record<
  string,
  {
    params:
      | ({ name: 'HMAC' } & HmacImportParams & AlgorithmIdentifier)
      | ({ name: 'RSASSA-PKCS1-v1_5' } & RsaHashedImportParams & AlgorithmIdentifier)
      | ({ name: 'RSA-PSS' } & RsaHashedImportParams & RsaPssParams)
      | ({ name: 'ECDSA' | 'ECDH-ES' } & EcKeyImportParams & EcdsaParams);
  }
>;

/**
 * JWT creation based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class JwtFactory {
  readonly #jwkLoader: JwkLoader;
  readonly #header: JwtHeaderOptions;
  readonly #payload: JwtPayloadOptions;
  readonly #lifetime: number;
  readonly #crypto: Pick<Crypto, 'randomUUID'> & { subtle: Pick<SubtleCrypto, 'importKey' | 'sign'> };

  constructor({
    jwkLoader,
    header = {},
    payload = {},
    lifetime = 20 * SECONDS_PER_MINUTE,
    crypto = GLOBAL_CRYPTO,
  }: JwtFactoryOptions) {
    this.#jwkLoader = jwkLoader;
    this.#header = header;
    this.#payload = payload;
    this.#lifetime = lifetime;
    this.#crypto = crypto;
  }

  async create({
    jwkLoader = this.#jwkLoader,
    header = {},
    payload = {},
    lifetime = this.#lifetime,
  }: Partial<Omit<JwtFactoryOptions, 'crypto'>> = {}): Promise<Jwt> {
    const jwk = await jwkLoader.load();

    if (typeof jwk.alg !== 'string') {
      throw new Error('missing JWK algorithm');
    }

    if (!(jwk.alg in algorithms)) {
      throw new Error('unsupported JWK algorithm');
    }

    const alg = jwk.alg as JwkAlgorithm;
    const { params } = algorithms[alg];
    const key = await this.#crypto.subtle.importKey('jwk', jwk, params, false, ['sign']);
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);
    const headerJson = JSON.stringify({
      typ: 'JWT',
      alg,
      kid: jwk.kid,
      ...this.#header,
      ...header,
    } satisfies JwtHeader);
    const payloadJson = JSON.stringify({
      jti: payload?.jti ?? `${this.#crypto.randomUUID()}-${now.toString(16)}`,
      iat: nowSeconds,
      exp: nowSeconds + Math.ceil(Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, lifetime >>> 0))),
      ...this.#payload,
      ...payload,
    } satisfies JwtPayload);
    const headerString = base64UrlEncode(headerJson);
    const payloadString = base64UrlEncode(payloadJson);
    const signature = base64UrlEncode(
      await this.#crypto.subtle.sign(params, key, new TextEncoder().encode(`${headerString}.${payloadString}`)),
    );

    return {
      value: `${headerString}.${payloadString}.${signature}`,
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson),
      signature,
    };
  }
}
