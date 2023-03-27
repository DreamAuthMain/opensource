# DreamAuth JWT Factory

JWT creation based on [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

```ts
// Create a JWT factory instance.
const jwtFactory = new JwtFactory({
  // Required. Default private JWK loader (implementation specific).
  jwkLoader,
  // Optional. Default JWT header claims.
  header: { ... },
  // Optional. Default JWT payload claims.
  payload: { ... },
  // Optional. Expiration time in seconds (default 20 minutes).
  lifetime: 1200,
  // Optional (default `crypto` global).
  crypto: window.crypto,
});

// Load your private JWK (implementation specific).
const jwk = ...;

// Create a JWT.
const jwt = jwtFactory.create({
  // Optional. Private JWK loader.
  jwkLoader,
  // Optional. JWT header claims (extends default).
  header: { ... },
  // Optional. JWT payload claims (extends default).
  payload: { ... },
  // Optional. Expiration time in seconds.
  lifetime: 1200,
});
```

**NOTE:** JWKs _MUST_ include an "alg" parameter.

The following JWK algorithms are supported.

- **HMAC**: Not Recommended (shared secret required)
  - `HS256`
  - `HS384`
  - `HS512`
- **RSASSA-PKCS1-v1_5**: Good (wide support, potential [vulnerability](https://www.cvedetails.com/cve/CVE-2020-20949/))
  - `RS256`
  - `RS384`
  - `RS512`
- **RSASSA-PSS**: Better (mediocre support, fixed above vulnerability)
  - `PS256`
  - `PS384`
  - `PS512`
- **ECDSA**: Best (good support, suggested for new implementations)
  - `ES256`
  - `ES384`
  - `ES512`

The returned `jwt` object has the following properties.

- `value` - JWT string
- `header` - claims object
- `payload` - claims object
- `signature` - string

## Related

- [jwk-factory](https://www.npmjs.com/package/@dreamauth/jwk-factory) - JWK creation based on Web Crypto.
- [jwk-resolver](https://www.npmjs.com/package/@dreamauth/jwk-resolver) - JWK resolver compatible with [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).
- [jwt-decoder](https://www.npmjs.com/package/@dreamauth/jwt-decoder) - JWT decoding based on Web Crypto.
