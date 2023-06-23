// import { createParams } from './create-params.js';

export const params = {
  HS256: {
    name: 'HMAC',
    hash: 'SHA-256',
    // length: 256,
  },
  HS384: {
    name: 'HMAC',
    hash: 'SHA-384',
    // length: 384,
  },
  HS512: {
    name: 'HMAC',
    hash: 'SHA-512',
    // length: 512,
  },
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
} as const satisfies Record<
  string,
  | ({ name: 'HMAC' } & HmacImportParams)
  | ({ name: 'RSASSA-PKCS1-v1_5' } & RsaHashedImportParams)
  | ({ name: 'RSA-PSS' } & RsaHashedImportParams)
  | ({ name: 'ECDSA' } & EcKeyImportParams)
  | ({ name: 'RSA-OAEP' } & RsaHashedImportParams)
>;

// export const [getImportParams, hasImportParams] = createParams(params);
