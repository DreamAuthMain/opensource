import { type Jwk } from '@dreamauth/types';

import { fetchOIDCJwks } from './fetch-oidc-jwks.js';
import { fetchOIDCJwksUri } from './fetch-oidc-jwks-uri.js';

export interface JwkLoader {
  load(iss: string): Promise<Jwk[]>;
}

export class JwkOIDCLoader implements JwkLoader {
  async load(iss: string): Promise<Jwk[]> {
    if (
      !iss.startsWith('https://') &&
      !iss.startsWith('http://localhost:') &&
      !iss.startsWith('http://localhost/') &&
      iss !== 'http://localhost'
    ) {
      return [];
    }

    const baseUri = iss + (iss.endsWith('/') ? '' : '/') + '.well-known';
    const uri = await fetchOIDCJwksUri(baseUri);
    const jwks = await fetchOIDCJwks(uri);

    return jwks;
  }
}
