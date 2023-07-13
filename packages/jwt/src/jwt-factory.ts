import { base64UrlEncode } from '@dreamauth/base64url';
import { JwkImporter } from '@dreamauth/jwk';
import { type Jwk, type JwtHeader, type JwtIssuerUrl, type JwtPayload, type PartialCrypto } from '@dreamauth/types';

import { PARAMS } from './params.js';

export interface JwtFactoryOptions {
  /**
   * Default header claims.
   */
  readonly header?: Partial<JwtHeader>;
  /**
   * Default payload claims.
   */
  readonly payload?: Partial<JwtPayload>;
  /**
   * JWT lifetime in seconds.
   */
  readonly lifetime?: number;
}

/**
 * JWT creation based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class JwtFactory {
  readonly #crypto: PartialCrypto<'randomUUID' | 'importKey' | 'sign'>;
  readonly #jwkImporter: JwkImporter;
  readonly #issuer: JwtIssuerUrl;
  readonly #header: Partial<JwtHeader>;
  readonly #payload: Partial<JwtPayload>;
  readonly #lifetime: number;

  constructor(
    crypto: PartialCrypto<'randomUUID' | 'importKey' | 'sign'>,
    issuer: JwtIssuerUrl,
    { header = {}, payload = {}, lifetime = 86_400 /* 24 hours in seconds */ }: JwtFactoryOptions = {},
  ) {
    this.#crypto = crypto;
    this.#jwkImporter = new JwkImporter(crypto);
    this.#issuer = issuer;
    this.#header = header;
    this.#payload = payload;
    this.#lifetime = lifetime;
  }

  async create(
    jwk: Jwk<keyof typeof PARAMS, 'sign'>,
    { header = {}, payload = {}, lifetime = this.#lifetime }: Partial<JwtFactoryOptions> = {},
  ): Promise<string> {
    const params = PARAMS[jwk.alg];
    const key = await this.#jwkImporter.import(jwk, 'sign');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const headerFinal: JwtHeader = {
      ...this.#header,
      ...header,
      typ: 'JWT',
      kid: jwk.kid,
      alg: jwk.alg,
    };
    const payloadFinal: JwtPayload = {
      ...this.#payload,
      ...payload,
      iss: payload.iss ?? this.#issuer,
      iat: payload.iat ?? nowSeconds - 5,
      exp: payload.exp ?? nowSeconds + Math.ceil(lifetime) + 5,
    };
    const headerJson = JSON.stringify(headerFinal);
    const payloadJson = JSON.stringify(payloadFinal);
    const headerString = base64UrlEncode(headerJson);
    const payloadString = base64UrlEncode(payloadJson);
    const signatureBytes = await this.#crypto.subtle.sign(
      params,
      key,
      new TextEncoder().encode(`${headerString}.${payloadString}`),
    );
    const signature = base64UrlEncode(signatureBytes);

    return `${headerString}.${payloadString}.${signature}`;
  }
}
