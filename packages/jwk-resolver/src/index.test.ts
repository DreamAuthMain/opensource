import { JwkResolver } from './index.js';

describe('JwkResolver', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch').mockImplementation(async () => new Response(null, { status: 404 }));
  });

  test('oidc compatible', async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ jwks_uri: 'https://example.com/jwks.json' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [{ kid: '123' }] })));

    const resolver = new JwkResolver({ issuers: ['https://example.com'] });
    const jwk = await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });

    expect(fetch).toHaveBeenNthCalledWith(1, 'https://example.com/.well-known/openid-configuration', {
      headers: { accept: 'application/json' },
      mode: 'cors',
    });
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com/jwks.json', {
      headers: { accept: 'application/json' },
      mode: 'cors',
    });
    expect(jwk).toMatchObject({ kid: '123' });
  });

  test('oidc non-standard jwks.json fallback', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));

    const resolver = new JwkResolver({ issuers: ['https://example.com'] });
    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });

    expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com/.well-known/jwks.json', {
      headers: { accept: 'application/json' },
      mode: 'cors',
    });
  });

  test('restricted issuers', async () => {
    const resolver = new JwkResolver({ issuers: ['https://example.com'] });
    const jwk = await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://other.com' },
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(jwk).toBeUndefined();
  });

  test('cached', async () => {
    jest.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({ keys: [{ kid: '123' }] })));

    const resolver = new JwkResolver({ issuers: ['https://example.com'] });

    await expect(
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
    ).resolves.toBeTruthy();
    await expect(
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
    ).resolves.toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('cache disabled', async () => {
    jest.useFakeTimers();
    jest.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({ keys: [{ kid: '123' }] })));
    const resolver = new JwkResolver({
      issuers: ['https://example.com'],
      ttl: 0,
      ttlDiscovery: 0,
      ttlJwks: 0,
      retryDelay: 0,
    });

    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });
    expect(fetch).toHaveBeenCalledTimes(2);

    jest.runAllTimers();

    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  test('simultaneous requests do not duplicate work', async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [{ kid: '123' }] })));

    const resolver = new JwkResolver({ issuers: ['https://example.com'] });

    await Promise.all([
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('kid not found', async () => {
    jest.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({ keys: [{ kid: '234' }] })));
    const resolver = new JwkResolver({ issuers: ['https://example.com'] });

    await expect(
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
    ).resolves.toBeUndefined();
  });

  test('cache eviction (max)', async () => {
    jest.useFakeTimers();

    const resolver = new JwkResolver({ issuers: ['https://example.com', 'https://other.com'], max: 3 });

    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });
    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });
    expect(fetch).toHaveBeenCalledTimes(2);

    // Cache full: 2 fetches and 1 token = 3 entries.
    jest.runAllTimers();
    // Cache full. Nothing evicted.

    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://other.com' },
    });
    expect(fetch).toHaveBeenCalledTimes(4);

    // Cache overfull: 4 fetches and 2 tokens = 6 entries.
    jest.runAllTimers();
    // Cache full. All 3 example.com entries evicted.

    await resolver.resolve({
      header: { kid: '123' },
      payload: { iss: 'https://example.com' },
    });
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  test('issuer trailing slash', async () => {
    const resolver = new JwkResolver({ issuers: ['https://example.com/123/'] });

    await resolver.resolve({
      header: { kid: '345' },
      payload: { iss: 'https://example.com/123/' },
    });
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.com/123/.well-known/openid-configuration',
      expect.anything(),
    );
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://example.com/123/.well-known/jwks.json', expect.anything());
  });

  test('invalid jwks.json response', async () => {
    jest.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify({ keys: null })));
    const resolver = new JwkResolver({ issuers: ['https://example.com'] });

    await expect(
      resolver.resolve({
        header: { kid: '123' },
        payload: { iss: 'https://example.com' },
        use: 'sig',
      }),
    ).resolves.toBeUndefined();
  });

  describe('optional claims matching', () => {
    (
      [
        ['HS256', 'oct'],
        ['RS256', 'RSA'],
        ['PS256', 'RSA'],
        ['ES256', 'EC', 'P-256'],
        ['OTHER', undefined],
      ] as const
    ).forEach(([alg, kty, crv]) => {
      test(alg, async () => {
        jest.mocked(fetch).mockImplementation(
          async () =>
            new Response(
              JSON.stringify({
                keys: [
                  { kid: '123', use: 'enc', alg, kty, crv },
                  { kid: '123', use: 'sig', alg, kty },
                  { kid: '123', use: 'sig', alg, kty, crv },
                ],
              }),
            ),
        );
        const resolver = new JwkResolver({ issuers: ['https://example.com'] });

        await expect(
          resolver.resolve({
            header: { kid: '123', alg },
            payload: { iss: 'https://example.com' },
            use: 'sig',
          }),
        ).resolves.toMatchObject(JSON.parse(JSON.stringify({ kid: '123', use: 'sig', alg, kty, crv })));
      });
    });
  });

  test('retry if JWK missing in cached data', async () => {
    const resolver = new JwkResolver({ issuers: ['https://example.com'] });

    await resolver.resolve({ header: { kid: '123' }, payload: { iss: 'https://example.com' } });
    expect(fetch).toHaveBeenCalledTimes(2);

    await resolver.resolve({ header: { kid: '123' }, payload: { iss: 'https://example.com' } });
    expect(fetch).toHaveBeenCalledTimes(2);

    await resolver.resolve({ header: { kid: '234' }, payload: { iss: 'https://example.com' } });
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});
