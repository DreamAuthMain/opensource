import { beforeEach, describe, expect, vi } from 'vitest';

import { fetchOIDCJwks } from './fetch-oidc-jwks.js';
import { fetchOIDCJwksUri } from './fetch-oidc-jwks-uri.js';
import { JwkOIDCLoader } from './jwk-loader.js';

vi.mock('./fetch-oidc-jwks-uri.js', () => ({
  fetchOIDCJwksUri: vi.fn(),
}));
vi.mock('./fetch-oidc-jwks.js', () => ({
  fetchOIDCJwks: vi.fn(),
}));

describe('JwkLoader', (test) => {
  beforeEach(() => {
    vi.mocked(fetchOIDCJwksUri).mockResolvedValue('https://example.com/jwks.json');
    vi.mocked(fetchOIDCJwks).mockResolvedValue([{ kid: '1', alg: 'RS256', key_ops: ['sign'] }]);
  });

  test('valid url issuer', async () => {
    const loader = new JwkOIDCLoader();
    const jwks = await loader.load('https://example.com');
    expect(fetchOIDCJwksUri).toHaveBeenLastCalledWith('https://example.com/.well-known');
    expect(fetchOIDCJwks).toHaveBeenLastCalledWith('https://example.com/jwks.json');
    expect(jwks).toEqual([{ kid: '1', alg: 'RS256', key_ops: ['sign'] }]);
  });

  test('non-url issuer', async () => {
    const loader = new JwkOIDCLoader();
    const jwks = await loader.load('not-a-valid-issuer');
    expect(fetchOIDCJwksUri).not.toHaveBeenCalled();
    expect(fetchOIDCJwks).not.toHaveBeenCalled();
    expect(jwks).toEqual([]);
  });

  test('insecure url issuer', async () => {
    const loader = new JwkOIDCLoader();
    const jwks = await loader.load('http://example.com');
    expect(fetchOIDCJwksUri).not.toHaveBeenCalled();
    expect(fetchOIDCJwks).not.toHaveBeenCalled();
    expect(jwks).toEqual([]);
  });

  (['http://localhost', 'http://localhost:8080', 'http://localhost/foo/'] as const).forEach((iss) => {
    test(`localhost (${iss}) issuer`, async () => {
      const loader = new JwkOIDCLoader();
      const jwks = await loader.load(iss);
      expect(fetchOIDCJwksUri).toHaveBeenLastCalledWith(`${iss.replace(/\/$/u, '')}/.well-known`);
      expect(fetchOIDCJwks).toHaveBeenLastCalledWith(`https://example.com/jwks.json`);
      expect(jwks).toEqual([{ kid: '1', alg: 'RS256', key_ops: ['sign'] }]);
    });
  });
});
