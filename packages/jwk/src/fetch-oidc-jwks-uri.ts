import { isObject } from '@dreamauth/util';

/**
 * Fetch the JSON Web Key Set (JWKS) URI from the OpenID Connect configuration.
 */
export const fetchOIDCJwksUri = async (baseUrl: string): Promise<string> => {
  const response = await fetch(`${baseUrl}/openid-configuration`)
    .catch(() => null);
  const body: unknown = await response?.json()
    .catch(() => null);

  return response?.ok && isObject(body) && typeof body.jwks_uri === 'string' ? body.jwks_uri : `${baseUrl}/jwks.json`;
};
