export const PARAMS = {
  HS256: {
    name: 'HMAC',
  },
  HS384: {
    name: 'HMAC',
  },
  HS512: {
    name: 'HMAC',
  },
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
  },
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
  },
  RS512: {
    name: 'RSASSA-PKCS1-v1_5',
  },
  PS256: {
    name: 'RSA-PSS',
    saltLength: 32,
  },
  PS384: {
    name: 'RSA-PSS',
    saltLength: 48,
  },
  PS512: {
    name: 'RSA-PSS',
    saltLength: 64,
  },
  ES256: {
    name: 'ECDSA',
    hash: 'SHA-256',
  },
  ES384: {
    name: 'ECDSA',
    hash: 'SHA-384',
  },
  ES512: {
    name: 'ECDSA',
    hash: 'SHA-512',
  },
} as const satisfies Record<string, AlgorithmIdentifier | RsaPssParams | EcdsaParams>;
