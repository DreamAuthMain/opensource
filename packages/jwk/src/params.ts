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
} as const satisfies Record<string, RsaHashedImportParams | EcKeyImportParams>;

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
  string,
  RsaHashedKeyGenParams & { keyUsage: readonly ['verify', 'sign'] | readonly ['encrypt', 'decrypt'] }
>;

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
} as const satisfies Record<string, EcKeyGenParams>;
