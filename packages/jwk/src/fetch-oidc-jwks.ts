import { isArray, isJwk, isObject, type Jwk } from '@dreamauth/types';

import { IMPORT_PARAMS } from './params.js';

const algs = Object.keys(IMPORT_PARAMS) as [keyof typeof IMPORT_PARAMS, ...(keyof typeof IMPORT_PARAMS)[]];

export const fetchOIDCJwks = async (jwksUri: string): Promise<Jwk<keyof typeof IMPORT_PARAMS>[]> => {
  const response = await fetch(jwksUri).catch(() => null);
  const body: unknown = await response?.json().catch(() => null);

  return response?.ok && isObject(body) && isArray(body.keys)
    ? body.keys.filter((jwk: unknown): jwk is Jwk<keyof typeof IMPORT_PARAMS> => isJwk(jwk, algs))
    : [];
};
