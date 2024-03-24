import { describe, expect, vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

import { fetchOIDCJwks } from './fetch-oidc-jwks.js';

createFetchMock(vi)
  .enableMocks();

describe('fetchOidcJwksUri', (test) => {
  test('success', async () => {
    fetchMock.mockResponseOnce(() => ({ body: JSON.stringify({ keys: [{ kid: '1', alg: 'RS256' }] }) }));
    const response = await fetchOIDCJwks('https://example.com/jwks.json');
    expect(fetch)
      .toHaveBeenLastCalledWith('https://example.com/jwks.json');
    expect(response)
      .toEqual([{ kid: '1', alg: 'RS256' }]);
  });

  test('not ok', async () => {
    fetchMock.mockResponseOnce(() => ({ status: 404 }));
    const response = await fetchOIDCJwks('https://example.com/jwks.json');
    expect(response)
      .toEqual([]);
  });

  test('unexpected body', async () => {
    fetchMock.mockResponseOnce(() => ({ body: '{}' }));
    const response = await fetchOIDCJwks('https://example.com/jwks.json');
    expect(response)
      .toEqual([]);
  });
});
