# ISOAuth JWT Decoder

JWT decoding based on [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

```ts
// Create a JWT decoder instance.
const jwtDecoder = new JwtDecoder({
  // Optional (recommended). Default JWK resolver for JWS verification.
  jwkResolver,
  // Optional (default `crypto` global).
  crypto: window.crypto,
  // Optional (recommended). Log (or throw) on JWT decode failures.
  onFailure: (code: JwtDecodeError, error?: unknown) => { ... },
});

// Decode (and verify) a JWT.
const jwt = jwtDecoder.decode(token, {
  // Optional. JWK resolver for JWS verification.
  jwkResolver,
});
```

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

The `jwt` object with the following properties is returned if the JWT is successfully decoded and verified.

- `value` - JWT string
- `header` - claims object
- `payload` - claims object
- `signature` - string

A `null` value is returned if the JWT cannot be decoded or verified for any reason, unless an `onFailure` handler throws an error.

## Related

- [jwk-factory](../jwk-factory) - JWK creation based on Web Crypto.
- [jwk-resolver](../jwk-resolver) - JWK resolver compatible with [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).
- [jwt-factory](../jwk-factory) - JWT creation based on Web Crypto.
