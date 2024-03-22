import { type Jwk } from '@dreamauth/types';

import { fetchOIDCJwks } from './fetch-oidc-jwks.js';
import { fetchOIDCJwksUri } from './fetch-oidc-jwks-uri.js';

/**
 * JWK loader interface.
 */
export interface JwkLoader {
  /**
   * Load JWKs from an issuer.
   */
  load(iss: string): Promise<Jwk[]>;
}

/**
 * JWK loader for OpenID Connect (OIDC) issuers.
 */
export class JwkOIDCLoader implements JwkLoader {
  /**
   * Load JWKs from an issuer.
   */
  async load(iss: string): Promise<Jwk[]> {
    if (
      !iss.startsWith('https://')
      && !iss.startsWith('http://localhost:')
      && !iss.startsWith('http://localhost/')
      && iss !== 'http://localhost'
    ) {
      return [];
    }

    const baseUri = iss + (iss.endsWith('/') ? '' : '/') + '.well-known';
    const uri = await fetchOIDCJwksUri(baseUri);
    const jwks = await fetchOIDCJwks(uri);

    return jwks;
  }
}
