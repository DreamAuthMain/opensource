import { type JWK_SIG_ALGS } from '@dreamauth/jwk';

export const PARAMS = {
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
} as const satisfies Record<(typeof JWK_SIG_ALGS)[number], AlgorithmIdentifier | RsaPssParams | EcdsaParams>;
