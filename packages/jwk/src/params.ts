/**
 * JWK RSA encryption algorithms.
 */
export const JWK_RSA_ENC_ALGS = ['RSA-OAEP-256'] as const;

/**
 * JWK RSA signature algorithms.
 */
export const JWK_RSA_SIG_ALGS = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'] as const;

/**
 * JWK RSA signature and encryption algorithms.
 */
export const JWK_RSA_ALGS = [...JWK_RSA_ENC_ALGS, ...JWK_RSA_SIG_ALGS] as const;

/**
 * JWK Elliptic Curve Cryptography (ECC) signature algorithms.
 */
export const JWK_ECC_SIG_ALGS = ['ES256', 'ES384', 'ES512'] as const;

/**
 * JWK signature algorithms.
 */
export const JWK_SIG_ALGS = [...JWK_RSA_SIG_ALGS, ...JWK_ECC_SIG_ALGS] as const;

/**
 * JWK signature and encryption algorithms.
 */
export const JWK_ALGS = [...JWK_RSA_ENC_ALGS, ...JWK_RSA_SIG_ALGS, ...JWK_ECC_SIG_ALGS] as const;

/**
 * JWK import parameters for various algorithms.
 */
export const IMPORT_PARAMS = {
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
  },
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-384',
  },
  RS512: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-512',
  },
  PS256: {
    name: 'RSA-PSS',
    hash: 'SHA-256',
  },
  PS384: {
    name: 'RSA-PSS',
    hash: 'SHA-384',
  },
  PS512: {
    name: 'RSA-PSS',
    hash: 'SHA-512',
  },
  ES256: {
    name: 'ECDSA',
    namedCurve: 'P-256',
  },
  ES384: {
    name: 'ECDSA',
    namedCurve: 'P-384',
  },
  ES512: {
    name: 'ECDSA',
    namedCurve: 'P-521',
  },
  'RSA-OAEP-256': {
    name: 'RSA-OAEP',
    hash: 'SHA-256',
  },
} as const satisfies Record<(typeof JWK_ALGS)[number], RsaHashedImportParams | EcKeyImportParams>;

/**
 * JWK generation parameters for RSA algorithms.
 */
export const GEN_RSA_PARAMS = {
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-384',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  RS512: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-512',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  PS256: {
    name: 'RSA-PSS',
    hash: 'SHA-256',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  PS384: {
    name: 'RSA-PSS',
    hash: 'SHA-384',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  PS512: {
    name: 'RSA-PSS',
    hash: 'SHA-512',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['verify', 'sign'],
  },
  'RSA-OAEP-256': {
    name: 'RSA-OAEP',
    hash: 'SHA-256',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    keyUsage: ['encrypt', 'decrypt'],
  },
} as const satisfies Record<
  (typeof JWK_RSA_ALGS)[number],
  RsaHashedKeyGenParams & { keyUsage: readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'] }
>;

/**
 * JWK generation parameters for ECC algorithms.
 */
export const GEN_ECC_PARAMS = {
  ES256: {
    name: 'ECDSA',
    namedCurve: 'P-256',
  },
  ES384: {
    name: 'ECDSA',
    namedCurve: 'P-384',
  },
  ES512: {
    name: 'ECDSA',
    namedCurve: 'P-521',
  },
} as const satisfies Record<(typeof JWK_ECC_SIG_ALGS)[number], EcKeyGenParams>;
