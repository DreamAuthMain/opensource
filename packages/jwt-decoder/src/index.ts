import { base64UrlDecode } from '@isoauth/base64url-decode';

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
type Json = Exclude<JsonObject[string], undefined>;

export type JwkAlgorithm = keyof typeof algorithms;

export interface Jwk extends JsonWebKey {
  readonly kid?: string;
}

export interface JwtHeader extends JsonObject {
  readonly typ: 'JWT';
  readonly alg: JwkAlgorithm;
  readonly kid?: string;
}

export interface JwtData {
  readonly header: JwtHeader;
  readonly payload: JsonObject;
  readonly use: 'sig';
}

export interface JwkResolver {
  resolve(jwtData: JwtData): Promise<Jwk | null | undefined>;
}

export interface JwtDecoderOptions {
  readonly jwkResolver?: JwkResolver;
  readonly crypto?: { subtle: Pick<SubtleCrypto, 'importKey' | 'verify'> };
  readonly onFailure?: (code: JwtDecodeError, error?: unknown) => void;
}

export interface Jwt {
  readonly value: string;
  readonly header: JwtHeader;
  readonly payload: JsonObject;
  readonly signature: string;
}

const GLOBAL_CRYPTO = crypto;

const isJsonObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isJwtHeader = (value: Json): value is JsonObject & { typ: 'JWT'; alg: string; kid?: string } => {
  return (
    isJsonObject(value) &&
    value.typ === 'JWT' &&
    typeof value.alg === 'string' &&
    (typeof value.kid === 'undefined' || typeof value.kid === 'string')
  );
};

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

export enum JwtDecodeError {
  malformed = 'malformed',
  invalid = 'invalid',
  expired = 'expired',
  key_not_found = 'key not found',
  algorithm_unsupported = 'algorithm unsupported',
  algorithm_mismatch = 'algorithm mismatch',
  unverified = 'unverified',
}

/**
 * JWT decoding based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class JwtDecoder {
  readonly #jwkResolver: undefined | JwkResolver;
  readonly #crypto: { subtle: Pick<SubtleCrypto, 'importKey' | 'verify'> };
  readonly #onFailure: undefined | ((code: JwtDecodeError, error?: unknown) => void);

  constructor({ jwkResolver, crypto = GLOBAL_CRYPTO, onFailure }: JwtDecoderOptions = {}) {
    this.#jwkResolver = jwkResolver;
    this.#crypto = crypto;
    this.#onFailure = onFailure;
  }

  async decode(
    value: string,
    { jwkResolver = this.#jwkResolver }: Omit<JwtDecoderOptions, 'crypto' | 'onFailure'> = {},
  ): Promise<Jwt | null> {
    const [headerString = '', payloadString = '', signature = ''] = value.split('.', 3);
    let partialHeader, payload: Json;

    try {
      partialHeader = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerString)));
      payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadString)));
    } catch (error) {
      this.#onFailure?.(JwtDecodeError.malformed, error);
      return null;
    }

    if (!isJwtHeader(partialHeader) || !isJsonObject(payload)) {
      this.#onFailure?.(JwtDecodeError.invalid);
      return null;
    }

    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) {
      this.#onFailure?.(JwtDecodeError.expired);
      return null;
    }

    if (!(partialHeader.alg in algorithms)) {
      this.#onFailure?.(JwtDecodeError.algorithm_unsupported);
      return null;
    }

    const header = partialHeader as JwtHeader;

    if (jwkResolver) {
      const { params } = algorithms[header.alg];
      const jwk = await jwkResolver.resolve({ use: 'sig', header, payload });

      if (!jwk) {
        this.#onFailure?.(JwtDecodeError.key_not_found);
        return null;
      }

      if (jwk.alg && jwk.alg !== header.alg) {
        this.#onFailure?.(JwtDecodeError.algorithm_mismatch);
        return null;
      }

      const key = await this.#crypto.subtle.importKey('jwk', jwk, params, false, ['verify']);
      const verified = await this.#crypto.subtle.verify(
        params,
        key,
        base64UrlDecode(signature),
        new TextEncoder().encode(`${headerString}.${payloadString}`),
      );

      if (!verified) {
        this.#onFailure?.(JwtDecodeError.unverified);
        return null;
      }
    }

    return {
      value,
      header,
      payload,
      signature,
    };
  }
}
