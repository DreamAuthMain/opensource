import { isObject } from './is-object.js';

export type JwtIssuer = `https://${string}` | `http://localhost${`:${string}` | `/${string}` | ''}`;

export interface JwtHeader {
  readonly kid: string;
  readonly alg: string;
  readonly typ?: string;
  readonly [key: string]: unknown;
}

export interface JwtPayload {
  readonly iss: JwtIssuer;
  readonly exp: number;
  readonly nbf?: number;
  readonly iat?: number;
  readonly jti?: string;
  readonly sub?: string;
  readonly aud?: string;
  readonly [key: string]: unknown;
}

export interface Jwt {
  readonly header: JwtHeader;
  readonly headerString: string;
  readonly payload: JwtPayload;
  readonly payloadString: string;
  readonly signature: string;
}

export const isJwtHeader = (value: unknown): value is JwtHeader => {
  return (
    isObject(value) &&
    typeof value.kid === 'string' &&
    typeof value.alg === 'string' &&
    (value.type === undefined || typeof value.typ === 'string')
  );
};

export const isJwtPayload = (value: unknown): value is JwtPayload => {
  return (
    isObject(value) &&
    typeof value.iss === 'string' &&
    (value.iss.startsWith('https://') ||
      value.iss.startsWith('http://localhost:') ||
      value.iss.startsWith('http://localhost/') ||
      value.iss === 'http://localhost') &&
    typeof value.exp === 'number' &&
    (value.nbf === undefined || typeof value.nbf === 'number') &&
    (value.iat === undefined || typeof value.iat === 'number') &&
    (value.jti === undefined || typeof value.jti === 'string') &&
    (value.sub === undefined || typeof value.sub === 'string') &&
    (value.aud === undefined || typeof value.aud === 'string')
  );
};
