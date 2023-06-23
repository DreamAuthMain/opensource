# DreamAuth JWT Utilities

## JWT Decoder

JWT decoding based on [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

```ts
// Create a JWT decoder instance.
const jwtDecoder = new JwtDecoder({
  // Optional (recommended).
  verifier,
});

// Decode (and optionally verify) a JWT.
const jwt = jwtDecoder.decode(token);
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

- `header` - claims object
- `payload` - claims object
- `signature` - string

An error is thrown if the JWT cannot be decoded or verified.

## JWT Factory

TODO
