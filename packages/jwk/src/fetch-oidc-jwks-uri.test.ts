import { describe, expect, vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

import { fetchOIDCJwksUri } from './fetch-oidc-jwks-uri.js';

createFetchMock(vi)
  .enableMocks();

describe('fetchOidcJwksUri', (test) => {
  test('success', async () => {
    fetchMock.mockResponseOnce(() => ({ body: JSON.stringify({ jwks_uri: 'https://example.com/jwks.json' }) }));
    const uri = await fetchOIDCJwksUri('https://example.com/.well-known');
    expect(fetch)
      .toHaveBeenLastCalledWith('https://example.com/.well-known/openid-configuration');
    expect(uri)
      .toBe('https://example.com/jwks.json');
  });

  test('not ok', async () => {
    fetchMock.mockResponseOnce(() => ({ status: 404 }));
    const uri = await fetchOIDCJwksUri('https://example.com/.well-known');
    expect(uri)
      .toBe('https://example.com/.well-known/jwks.json');
  });

  test('unexpected body', async () => {
    fetchMock.mockResponseOnce(() => ({ body: '{}' }));
    const uri = await fetchOIDCJwksUri('https://example.com/.well-known');
    expect(uri)
      .toBe('https://example.com/.well-known/jwks.json');
  });
});
