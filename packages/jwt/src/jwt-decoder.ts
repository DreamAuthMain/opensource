import { base64UrlDecode } from '@dreamauth/base64url';

import { raise } from './errors.js';
import { isJwtHeader, isJwtPayload, type Jwt } from './jwt.js';
import { type JwtVerifier } from './jwt-verifier.js';

/**
 * JWT decoding based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class JwtDecoder {
  readonly #verifier: undefined | JwtVerifier;

  /**
   * Create a new JWT decoder.
   */
  constructor(verifier?: JwtVerifier) {
    this.#verifier = verifier;
  }

  /**
   * Decode a JWT.
   */
  async decode(value: string): Promise<Jwt> {
    const [headerString = '', payloadString = '', signature = ''] = value.split('.', 3);

    let header: unknown;
    let payload: unknown;

    try {
      header = JSON.parse(new TextDecoder()
        .decode(base64UrlDecode(headerString)));
      payload = JSON.parse(new TextDecoder()
        .decode(base64UrlDecode(payloadString)));
    }
    catch {
      return raise('Invalid');
    }

    if (!isJwtHeader(header) || !isJwtPayload(payload)) return raise('Invalid');

    const jwt: Jwt = { header, headerString, payload, payloadString, signature };

    await this.#verifier?.verify(jwt);

    return jwt;
  }
}
