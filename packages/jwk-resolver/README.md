# DreamAuth JWK Resolver

Caching JWK resolver compatible with [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) and [FAPI JWKS selection](https://openid.net/specs/openid-financial-api-part-2-1_0.html#duplicate-key-identifiers).

```ts
// Create a JWK factory instance.
const jwkResolver = new JwkResolver({
  // Optional (default 1000). Max number of cached JWKs (LRU).
  max: 1000,
  // Optional (default 24 hours). Resolved JWK cache timeout in ms.
  ttl: 24 * 60 * 60 * 1000,
  // Optional (default 24 hours). OIDC discovery cache timeout in ms.
  ttlDiscovery: 24 * 60 * 60 * 1000,
  // Optional (default 24 hours). JWKS cache timeout in ms.
  ttlJwks: 24 * 60 * 60 * 1000,
  // Optional (default 1 minute). Unresolved JWK retry delay in ms.
  retryDelay: 60 * 1000,
  // Optional (recommended). Allowed JWT issuers (any if undefined).
  issuers: ['https://example.com'],
});

// Resolve a JWK.
const jwk = await jwkResolver.resolve({
  header: {
    // Required. JWK key ID.
    kid: '123',
    // Optional. JWK key algorithm.
    alg: 'RS256',
  },
  payload: {
    // Required. JWT token issuer.
    iss: 'https://example.com',
  },
  // Optional. JWK key purpose.
  use: 'sig',
});
```

Resolution requires `payload.iss` and `header.kid` values, and is performed as follows.

- Fetch the OpenID configuration from `${iss}/.well-known/openid-configuration`
  - If the `jwks_uri` value exists, use it.
  - Else use `${iss}/.well-known/jwks.json`.
- Fetch the JWKS (JWK set) from the resolved JWKS URI.
  - If a valid JWKS is not fetched, return `null`.
- Filter by `header.kid`.
  - If no matching JWKs are found, return `null`.
- Filter by `use` and `header.alg` (undefined matches any).
  - If no matching JWKs are found, return `null`.
- Return the first JWK in the filtered set.

## Related

- [jwk-factory](https://www.npmjs.com/package/@dreamauth/jwk-factory) - JWK creation based on Web Crypto.
- [jwt-decoder](https://www.npmjs.com/package/@dreamauth/jwk-decoder) - JWT decoding based on Web Crypto.
- [jwt-factory](https://www.npmjs.com/package/@dreamauth/jwt-factory) - JWT creation based on Web Crypto.