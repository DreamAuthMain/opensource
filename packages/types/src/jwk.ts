import { isObject } from './is-object.js';

export interface Jwk extends JsonWebKey {
  readonly kid: string;
  readonly alg: string;
  readonly iat?: number;
  readonly nbf?: number;
  readonly exp?: number;
  readonly [key: string]: unknown;
}

export interface JwkPair {
  readonly privateKey: Jwk;
  readonly publicKey: Jwk;
}

export interface JwkSingleton {
  readonly key: Jwk;
}

export const isJwk = (value: unknown): value is Jwk => {
  return (
    isObject(value) &&
    typeof value.kid === 'string' &&
    typeof value.alg === 'string' &&
    (value.iat === undefined || typeof value.iat === 'number') &&
    (value.nbf === undefined || typeof value.nbf === 'number') &&
    (value.exp === undefined || typeof value.exp === 'number')
  );
};
