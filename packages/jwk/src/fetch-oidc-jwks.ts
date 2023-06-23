import { isJwk, isObject, type Jwk } from '@dreamauth/types';

import { IMPORT_PARAMS } from './params.js';

export const fetchOIDCJwks = async (jwksUri: string): Promise<Jwk[]> => {
  const response = await fetch(jwksUri).catch(() => null);
  const body: unknown = await response?.json().catch(() => null);

  return response?.ok && isObject(body) && Array.isArray(body.keys)
    ? body.keys.filter((jwk: unknown): jwk is Jwk => isJwk(jwk) && jwk.alg in IMPORT_PARAMS)
    : [];
};
