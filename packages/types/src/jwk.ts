import { isArray, isObject } from '@dreamauth/util';

export type Jwk<A extends string = string, O extends string = string> = Omit<JsonWebKey, 'key_ops'> & {
  readonly kid: string;
  readonly alg: A;
  readonly key_ops: readonly O[];
  readonly iat?: number;
  readonly nbf?: number;
  readonly exp?: number;
  readonly [key: string]: unknown;
};

export interface JwkPair<
  A extends string = string,
  TPublicOp extends string = string,
  TPrivateOp extends string = string,
> {
  readonly privateKey: Jwk<A, TPrivateOp>;
  readonly publicKey: Jwk<A, TPublicOp>;
}

const isJwkObject = (value: unknown): value is Jwk => {
  return (
    isObject(value)
    && typeof value.kid === 'string'
    && typeof value.alg === 'string'
    && (value.key_ops === undefined || (isArray(value.key_ops) && value.key_ops.every((op) => typeof op === 'string')))
    && (value.iat === undefined || typeof value.iat === 'number')
    && (value.nbf === undefined || typeof value.nbf === 'number')
    && (value.exp === undefined || typeof value.exp === 'number')
  );
};

export const isJwk: {
  <A extends string, O extends string>(value: unknown, algs: [A, ...A[]], ops: [O, ...O[]]): value is Jwk<A, O>;
  <A extends string>(value: unknown, algs: [A, ...A[]]): value is Jwk<A>;
  (value: unknown): value is Jwk;
} = (value: unknown, algs?: string[], ops?: string[]): value is Jwk => {
  if (!isJwkObject(value)) return false;
  if (algs && !algs.includes(value.alg)) return false;
  if (ops && !ops.every((op) => value.key_ops?.includes(op))) return false;
  return true;
};
