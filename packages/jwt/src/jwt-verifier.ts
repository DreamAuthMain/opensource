import { base64UrlDecode } from '@dreamauth/base64url';
import { JwkImporter, type JwkLoader, JwkOIDCLoader } from '@dreamauth/jwk';
import { SECONDS, time } from '@dreamauth/time';
import { isJwk, type Jwk, type Jwt, type PartialCrypto } from '@dreamauth/types';

import { error } from './errors.js';
import { PARAMS } from './params.js';

const algs = Object.keys(PARAMS) as unknown as [keyof typeof PARAMS, ...(keyof typeof PARAMS)[]];

/**
 * JWT validator which uses
 * [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
 * to verify JWT signatures.
 */
export class JwtVerifier {
  #crypto: PartialCrypto<'importKey' | 'verify'>['subtle'];
  #jwkImporter: JwkImporter;
  #issuers: Set<string>;
  #loader: JwkLoader;
  #cache = new Map<string, Jwk<keyof typeof PARAMS, 'verify'>[]>();

  constructor(
    crypto: PartialCrypto<'importKey' | 'verify'>,
    issuers: string[],
    loader: JwkLoader = new JwkOIDCLoader(),
  ) {
    this.#crypto = crypto.subtle;
    this.#jwkImporter = new JwkImporter(crypto);
    this.#issuers = new Set(issuers);
    this.#loader = loader;
  }

  async verify(jwt: Jwt): Promise<void> {
    const nowSeconds = time.now().as(SECONDS);

    if (!this.#issuers.has(jwt.payload.iss)) return error('InvalidJwtIss');
    if (jwt.payload.exp <= nowSeconds) return error('ExpiredJwt');
    if (jwt.payload.nbf != null && jwt.payload.nbf > nowSeconds) return error('InvalidJwtNbf');

    const cachedJwks: Jwk<keyof typeof PARAMS, 'verify'>[] | undefined = this.#cache.get(jwt.payload.iss);

    if (cachedJwks && (await this.#verify(jwt, cachedJwks))) return;

    const loadedJwks = await this.#loader
      .load(jwt.payload.iss)
      .then((values) =>
        values.filter((value): value is Jwk<keyof typeof PARAMS, 'verify'> => isJwk(value, algs, ['verify'])),
      );

    this.#cache.set(jwt.payload.iss, loadedJwks);

    if (await this.#verify(jwt, loadedJwks)) return;

    error('InvalidJwtSignature');
  }

  async #verify(jwt: Jwt, jwks: Jwk<keyof typeof PARAMS, 'verify'>[]): Promise<boolean> {
    const dataBytes = new TextEncoder().encode(`${jwt.headerString}.${jwt.payloadString}`);
    const signatureBytes = base64UrlDecode(jwt.signature);

    for (const jwk of jwks) {
      if (jwk.kid !== jwt.header.kid) continue;
      if (jwk.alg !== jwt.header.alg) continue;

      const key = await this.#jwkImporter.import(jwk, 'verify').catch(() => null);

      if (!key) continue;

      const params = PARAMS[jwk.alg];

      return await this.#crypto.verify(params, key, signatureBytes, dataBytes).catch(() => false);
    }

    return false;
  }
}
