import { JwkFactory } from '@isoauth/jwk-factory';
import { JwtDecoder } from '@isoauth/jwt-decoder';

import { JwtFactory } from './index.js';

describe('createJwt', () => {
  (
    [
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
      'PS256',
      'PS384',
      'PS512',
      'ES256',
      'ES384',
      'ES512',
    ] as const
  ).forEach((algorithm) => {
    test(algorithm, async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwkFactory = new JwkFactory({ algorithm });
      const jwk = await jwkFactory.create();
      const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
      const jwt = await jwtFactory.create();
      const decoder = new JwtDecoder({ jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey } });
      const decoded = await decoder.decode(jwt.value);

      expect(decoded?.value).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
      expect(decoded?.header).toMatchObject({ typ: 'JWT', alg: algorithm });
      expect(decoded?.payload).toMatchObject({
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
      expect(decoded?.payload.iat).toBeLessThanOrEqual(nowSeconds + 3);
      expect(decoded?.payload.exp).toBeGreaterThanOrEqual(nowSeconds + 20 * 60);
      expect(decoded?.payload.exp).toBeLessThanOrEqual(nowSeconds + 3 + 20 * 60);
    });
  });

  test('missing algorithm', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const { alg: _alg, ...privateKey }: any = { ...jwk.privateKey };
    const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => privateKey } });

    await expect(jwtFactory.create()).rejects.toThrow(new Error('missing JWK algorithm'));
  });

  test('unsupported algorithm type', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const privateKey: any = { ...jwk.privateKey, alg: 'XX256' };
    const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => privateKey } });

    await expect(jwtFactory.create()).rejects.toThrow(new Error('unsupported JWK algorithm'));
  });

  test('unsupported algorithm hash length', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const privateKey: any = { ...jwk.privateKey, alg: 'RS128' };
    const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => privateKey } });

    await expect(jwtFactory.create()).rejects.toThrow(new Error('unsupported JWK algorithm'));
  });

  test('overrides', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const jwtFactory = new JwtFactory({
      jwkLoader: { load: async () => undefined as any },
      header: { foo: 1, bar: 2 },
      payload: { foo: 'a', bar: 'b' },
      lifetime: 1000,
    });
    const jwt = await jwtFactory.create({
      jwkLoader: { load: async () => jwk.privateKey },
      header: { bar: 3, baz: 4 },
      payload: { bar: 'c', baz: 'd' },
      lifetime: 2000,
    });

    expect(jwt).toMatchObject({
      header: { foo: 1, bar: 3, baz: 4 },
      payload: { foo: 'a', bar: 'c', baz: 'd' },
    });
    expect(jwt.payload.exp).toBeGreaterThan(Date.now() / 1000 + 1005);
    expect(jwt.payload.exp).toBeLessThanOrEqual(Date.now() / 1000 + 2005);
  });
});
