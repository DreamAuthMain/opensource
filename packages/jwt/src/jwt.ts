import { isObject } from '@dreamauth/util';

/**
 * JSON Web Token (JWT) issuer URL.
 */
export type JwtIssuerUrl = `https://${string}` | `http://localhost${`:${string}` | `/${string}` | ''}`;

/**
 * JSON Web Token (JWT) header.
 */
export interface JwtHeader {
  /**
   * Key ID (kid) of the key used to sign the token.
   */
  readonly kid: string;
  /**
   * Algorithm used to sign the token.
   */
  readonly alg: string;
  readonly [key: string]: unknown;
}

/**
 * JSON Web Token (JWT) payload.
 */
export interface JwtPayload {
  /**
   * Issuer URL of the token.
   */
  readonly iss: JwtIssuerUrl;
  /**
   * Expiration time of the token.
   */
  readonly exp: number;
  /**
   * Not before time of the token.
   */
  readonly nbf?: number;
  readonly [key: string]: unknown;
}

/**
 * JSON Web Token (JWT) as defined in RFC 7519.
 */
export interface Jwt {
  /**
   * The header of the token.
   */
  readonly header: JwtHeader;
  /**
   * The undecoded header string of the token.
   */
  readonly headerString: string;
  /**
   * The payload of the token.
   */
  readonly payload: JwtPayload;
  /**
   * The undecoded payload string of the token.
   */
  readonly payloadString: string;
  /**
   * The signature of the token.
   */
  readonly signature: string;
}

/**
 * JSON Web Token (JWT) header type predicate.
 */
export const isJwtHeader = (value: unknown): value is JwtHeader => {
  return isObject(value) && typeof value.kid === 'string' && typeof value.alg === 'string';
};

/**
 * JSON Web Token (JWT) payload type predicate.
 */
export const isJwtPayload = (value: unknown): value is JwtPayload => {
  return (
    isObject(value)
    && typeof value.iss === 'string'
    && (value.iss.startsWith('https://')
    || value.iss.startsWith('http://localhost:')
    || value.iss.startsWith('http://localhost/')
    || value.iss === 'http://localhost')
    && typeof value.exp === 'number'
    && (value.nbf === undefined || typeof value.nbf === 'number')
  );
};
