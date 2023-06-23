import { JwkImporter, type JwkLoader } from '@dreamauth/jwk';
import { type Jwk, type Jwt, type PartialCrypto } from '@dreamauth/types';

import { error } from './errors.js';
import { PARAMS } from './params.js';

/**
 * JWT validator which uses
 * [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
 * to verify JWT signatures.
 */
export class JwtVerifier {
  #crypto: PartialCrypto<'importKey' | 'verify'>['subtle'];
  #jwkImporter: JwkImporter;
  #issuers: Set<string>;
  cache = new Map<string, Jwk[]>();

  constructor(crypto: PartialCrypto<'importKey' | 'verify'>, issuers: string[]) {
    this.#crypto = crypto.subtle;
    this.#jwkImporter = new JwkImporter(crypto);
    this.#issuers = new Set(issuers);
  }

  async verify(jwt: Jwt, jwkLoader: JwkLoader): Promise<void> {
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (jwt.header.typ != null && jwt.header.typ !== 'JWT') return error('UnsupportedJwtTyp');
    if (jwt.payload.exp < nowSeconds) return error('ExpiredJwt');
    if (jwt.payload.iat != null && jwt.payload.iat > nowSeconds) return error('InvalidJwtIat');
    if (jwt.payload.nbf != null && jwt.payload.nbf > nowSeconds) return error('InvalidJwtNbf');

    const cachedJwks = this.cache.get(jwt.payload.iss);

    if (cachedJwks) {
      const matchingJwks = cachedJwks.filter((jwk) => jwk.kid === jwt.header.kid);

      if (matchingJwks.length && !(await this.#isValidSignature(jwt, cachedJwks))) return error('InvalidJwtSignature');
    }

    if (!this.#issuers.has(jwt.payload.iss)) return error('InvalidJwtIss');

    const jwks = await jwkLoader.load(jwt.payload.iss);
    const matchingJwks = jwks.filter((jwk) => jwk.kid === jwt.header.kid);

    this.cache.set(jwt.payload.iss, jwks);

    if (!(await this.#isValidSignature(jwt, matchingJwks))) return error('InvalidJwtSignature');
  }

  async #isValidSignature(jwt: Jwt, jwks: Jwk[]): Promise<boolean> {
    if (!(jwt.header.alg in PARAMS)) return error('UnsupportedJwtAlg');

    const params = PARAMS[jwt.header.alg as keyof typeof PARAMS];
    const dataBytes = new TextEncoder().encode(`${jwt.headerString}.${jwt.payloadString}`);
    const signatureBytes = new TextEncoder().encode(jwt.signature);

    // Filter by JWKs which have a matching algorithm.
    jwks = jwks.filter((jwk) => jwk.alg === jwt.header.alg);

    for (const jwk of jwks) {
      const key = await this.#jwkImporter.import(jwk, 'verify').catch(() => null);

      if (!key) continue;

      return await this.#crypto.verify(params, key, signatureBytes, dataBytes).catch(() => false);
    }

    return false;
  }
}
