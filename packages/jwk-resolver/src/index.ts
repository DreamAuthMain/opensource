type JsonObject = {
  readonly [key: string]:
    | readonly (JsonObject | undefined)[]
    | JsonObject
    | string
    | number
    | boolean
    | null
    | undefined;
};
type Json = Exclude<JsonObject[string], undefined>;

export type Issuer =
  | `https://${string}`
  | `http://localhost${'' | `${':' | '/'}${string}`}`
  | `http://${`127.` | `[::${number}]`}${string}`;
export interface Jwk extends JsonWebKey {
  readonly kid: string;
}
export interface JwkResolverOptions {
  readonly issuers: Issuer[];
  readonly max?: number;
  readonly ttl?: number;
  readonly ttlDiscovery?: number;
  readonly ttlJwks?: number;
  readonly retryDelay?: number;
}
export interface JwtData {
  readonly header: JsonObject;
  readonly payload: JsonObject;
  readonly use?: string;
}

const DEFAULT_MAX = 1000;
const DEFAULT_TTL = 86_400_000; // 24 hours in milliseconds
const DEFAULT_DISCOVERY_RES_TTL = 86_400_000; // 24 hours in milliseconds
const DEFAULT_JWKS_RES_TTL = 86_400_000; // 24 hours in milliseconds
const DEFAULT_RETRY_DELAY = 60_000; // 1 minute in milliseconds
const DEDUP_CLAIMS = ['use', 'alg', 'kty', 'crv'] as const;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isJwk = (value: unknown): value is Jwk => isObject(value) && typeof value.kid === 'string';
const parseJwksUri = (value: unknown): string | undefined =>
  isObject(value) && typeof value.jwks_uri === 'string' ? value.jwks_uri : undefined;
const parseJwks = (value: unknown): unknown[] | undefined =>
  isObject(value) && Array.isArray(value.keys) ? value.keys : undefined;
const getKty = (alg: Json | undefined): string | undefined => {
  return typeof alg !== 'string'
    ? undefined
    : alg.startsWith('RS') || alg.startsWith('PS')
    ? 'RSA'
    : alg.startsWith('ES')
    ? 'EC'
    : alg.startsWith('HS')
    ? 'oct'
    : undefined;
};
const getCrv = (alg: Json | undefined): string | undefined => {
  const match = typeof alg === 'string' ? alg.match(/^ES(\d{3})$/) ?? undefined : undefined;
  return match && `P-${match[1]}`;
};

/**
 * Caching JWK resolver compatible with
 * [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
 * and
 * [FAPI JWKS selection](https://openid.net/specs/openid-financial-api-part-2-1_0.html#duplicate-key-identifiers).
 */
export class JwkResolver {
  readonly #issuers: Set<string>;
  readonly #max: number;
  readonly #ttl: number;
  readonly #ttlDiscovery: number;
  readonly #ttlJwks: number;
  readonly #retryDelay: number;
  readonly #cache = new Map<string, { expiration: number; promise: Promise<any> }>();

  #timeoutCacheClean: number | undefined;

  constructor({
    issuers,
    max = DEFAULT_MAX,
    ttl = DEFAULT_TTL,
    ttlDiscovery = DEFAULT_DISCOVERY_RES_TTL,
    ttlJwks = DEFAULT_JWKS_RES_TTL,
    retryDelay = DEFAULT_RETRY_DELAY,
  }: JwkResolverOptions) {
    this.#issuers = new Set(issuers);
    this.#max = max;
    this.#ttl = ttl;
    this.#ttlDiscovery = ttlDiscovery;
    this.#ttlJwks = ttlJwks;
    this.#retryDelay = retryDelay;
  }

  async resolve({ header: { kid, alg }, payload: { iss }, use }: JwtData): Promise<Jwk | undefined> {
    // Ensure minimum data for OIDC Discovery and JWK matching.
    if (typeof kid !== 'string' || typeof iss !== 'string' || !this.#issuers.has(iss)) return;

    const claims = { iss, kid, use, alg, kty: getKty(alg), crv: getCrv(alg) };
    const jwkResult = this.#cacheGet(JSON.stringify(claims), this.#ttl, async () => {
      let jwk: Jwk | undefined;
      let cachedJwksUri: string | undefined;
      const url = iss + (iss.endsWith('/') ? '' : '/') + '.well-known/';
      const discoveryUrl = `${url}openid-configuration`;

      for (let i = 0; !jwk && i < 2; ++i) {
        // Retrying because the cached JWK URI may be outdated.
        if (i > 0) this.#cache.delete(discoveryUrl);

        const jwksUriResult = this.#cacheGet(
          discoveryUrl,
          this.#ttlDiscovery,
          async () => await this.#fetch(discoveryUrl, parseJwksUri),
        );
        const jwksUri = (await jwksUriResult.promise) ?? `${url}jwks.json`;

        // Skip retrying if cached and non-cached JWKS URIs are equal.
        if (jwksUri === cachedJwksUri) break;
        if (jwksUriResult.cached) cachedJwksUri = jwksUri;

        for (let j = 0; !jwk && j < 2; ++j) {
          // Retrying because the cached JWKS response may be outdated.
          if (j > 0) this.#cache.delete(jwksUri);

          const jwksResult = this.#cacheGet(jwksUri, this.#ttlJwks, async () => await this.#fetch(jwksUri, parseJwks));
          const keys = ((await jwksResult.promise) ?? []).filter((key): key is Jwk => isJwk(key) && key.kid === kid);

          if (keys.length > 1) {
            // Use dedup claims to select best match from many JWKs.
            jwk = keys
              .flatMap((key) => {
                let score = 0;

                for (const claim of DEDUP_CLAIMS) {
                  // Skip claim if undefined in either.
                  if (!claims[claim] || !key[claim]) continue;
                  // Omit JWK if claims mismatch.
                  if (claims[claim] !== key[claim]) return [];
                  // Claim match. Score is matched claim count.
                  score += 1;
                }

                return [{ score, key }];
              })
              // Use highest scored JWK match.
              .sort((a, b) => b.score - a.score)[0]?.key;
          } else {
            jwk = keys[0];
          }

          // Only retry if a cached JWKS response was used.
          if (!jwksResult.cached) break;
        }

        // Only retry if a cached JWK URI was used.
        if (!jwksUriResult.cached) break;
      }

      return jwk;
    });

    return await jwkResult.promise;
  }

  async #fetch<T>(url: string, parse: (value: Json) => T): Promise<T | undefined> {
    return await fetch(url, { headers: { accept: 'application/json' }, mode: 'cors' })
      .then(async (res) => (res.ok ? parse(await res.json()) : undefined))
      .catch(() => undefined);
  }

  #cacheGet<T>(
    key: string,
    ttl: number,
    provider: () => Promise<T>,
  ): { promise: Promise<T | undefined>; cached: boolean } {
    const entry = this.#cache.get(key);

    if (entry && entry.expiration >= Date.now()) return { promise: entry.promise, cached: true };

    const newEntry = {
      expiration: Number.POSITIVE_INFINITY,
      promise: Promise.resolve().then(async () => {
        const data = await provider();
        newEntry.expiration = Date.now() + (data === undefined ? this.#retryDelay : ttl);
        return data;
      }),
    };

    this.#cache.delete(key);
    this.#cache.set(key, newEntry);
    this.#cacheClean();

    return { promise: newEntry.promise, cached: false };
  }

  #cacheClean(): void {
    if (this.#timeoutCacheClean != null) return;

    this.#timeoutCacheClean = setTimeout(() => {
      this.#timeoutCacheClean = undefined;
      const now = Date.now();

      for (const [key, entry] of this.#cache.entries()) {
        entry.expiration < now && this.#cache.delete(key);
      }

      for (
        let keys = this.#cache.keys(), key = keys.next().value;
        this.#cache.size > this.#max && key != null;
        key = keys.next().value
      ) {
        this.#cache.delete(key);
      }
    }, 100);
  }
}
