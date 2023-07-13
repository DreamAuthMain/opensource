import { isObject } from './is-object.js';

export type JwtIssuerUrl = `https://${string}` | `http://localhost${`:${string}` | `/${string}` | ''}`;

export interface JwtHeader {
  readonly kid: string;
  readonly alg: string;
  readonly [key: string]: unknown;
}

export interface JwtPayload {
  readonly iss: JwtIssuerUrl;
  readonly exp: number;
  readonly nbf?: number;
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
  return isObject(value) && typeof value.kid === 'string' && typeof value.alg === 'string';
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
    (value.nbf === undefined || typeof value.nbf === 'number')
  );
};
