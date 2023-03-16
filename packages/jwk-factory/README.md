# ISOAuth JWK Factory

JWK creation based on [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Supports algorithms for JWT signing and verifying only (not encryption).

```ts
// Create a JWK factory instance.
const jwkFactory = new JwkFactory({
  // Optional (default RS256). Default signature algorithm.
  algorithm: 'RS256',
  // Optional (default 2048). Default modulus length (RS* and PS* algorithms).
  modulusLength: 2048
  // Optional (default global crypto).
  crypto: window.crypto,
})

// Create a JWK.
const jwk = await createJwk('RS256', {
  // Optional. Signature algorithm.
  algorithm: 'RS256',
  // Optional. Modulus length (RS* and PS* algorithms).
  modulusLength: 2048,
});
```

The following algorithms are supported.

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

Private keys are always generated.

```ts
const privateKey = await crypto.subtle.importKey('jwk', jwk.private, ...);
```

Public keys are not generated for `HS*` algorithms, which are symmetric.

```ts
if (jwk.public) {
  const publicKey = await crypto.subtle.importKey('jwk', jwk.public, ...);
}
```

## Related

- [jwk-resolver](../jwk-resolver) - JWK resolver compatible with [OIDC Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).
- [jwt-decoder](../jwk-decoder) - JWT decoding based on Web Crypto.
- [jwt-factory](../jwt-factory) - JWT creation based on Web Crypto.
