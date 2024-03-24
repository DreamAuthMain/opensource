import { base64UrlDecode } from '@dreamauth/base64url';
import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';
import { isJwk, type Jwk, JwkImporter, type JwkLoader, JwkOIDCLoader } from '@dreamauth/jwk';
import { SECONDS, time } from '@dreamauth/time';

import { raise } from './errors.js';
import { type Jwt } from './jwt.js';
import { PARAMS } from './params.js';

const algs = Object.keys(PARAMS) as unknown as [keyof typeof PARAMS, ...(keyof typeof PARAMS)[]];

interface JwtVerifierOptions {
  readonly loader?: JwkLoader;
  readonly crypto?: PlatformCryptoResolver;
}

/**
 * JWT verifier which uses
 * [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
 * to verify JWT signatures.
 */
export class JwtVerifier {
  #issuers: Set<string>;
  #loader: JwkLoader;
  #crypto: PlatformCryptoResolver;
  #jwkImporter: JwkImporter;
  #cache = new Map<string, Jwk<keyof typeof PARAMS, 'verify'>[]>();

  /**
   * Create a new JWT verifier.
   */
  constructor(issuers: string[], { loader = new JwkOIDCLoader(), crypto = getCrypto }: JwtVerifierOptions = {}) {
    this.#issuers = new Set(issuers);
    this.#loader = loader;
    this.#crypto = crypto;
    this.#jwkImporter = new JwkImporter(crypto);
  }

  /**
   * Verify a JWT.
   */
  async verify(jwt: Jwt): Promise<void> {
    const nowSeconds = time.now()
      .as(SECONDS);

    if (!this.#issuers.has(jwt.payload.iss)) return raise('InvalidIssuer');
    if (jwt.payload.exp <= nowSeconds) return raise('Expired');
    if (jwt.payload.nbf != null && jwt.payload.nbf > nowSeconds) return raise('NotYetValid');

    const cachedJwks: Jwk<keyof typeof PARAMS, 'verify'>[] | undefined = this.#cache.get(jwt.payload.iss);

    if (cachedJwks && (await this.#verify(jwt, cachedJwks))) return;

    const loadedJwks = await this.#loader
      .load(jwt.payload.iss)
      .then((values) => values.filter((value): value is Jwk<keyof typeof PARAMS, 'verify'> => isJwk(value, algs, ['verify'])));

    this.#cache.set(jwt.payload.iss, loadedJwks);

    if (await this.#verify(jwt, loadedJwks)) return;

    return raise('InvalidSignature');
  }

  async #verify(jwt: Jwt, jwks: Jwk<keyof typeof PARAMS, 'verify'>[]): Promise<boolean> {
    const dataBytes = new TextEncoder()
      .encode(`${jwt.headerString}.${jwt.payloadString}`);
    const signatureBytes = base64UrlDecode(jwt.signature);

    for (const jwk of jwks) {
      if (jwk.kid !== jwt.header.kid) continue;
      if (jwk.alg !== jwt.header.alg) continue;

      const key = await this.#jwkImporter.import(jwk, 'verify')
        .catch(() => null);

      if (!key) continue;

      const crypto = await this.#crypto();
      const params = PARAMS[jwk.alg];

      return await crypto.subtle.verify(params, key, signatureBytes, dataBytes)
        .catch(() => false);
    }

    return false;
  }
}
