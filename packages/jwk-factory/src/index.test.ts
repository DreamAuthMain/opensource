import { JwkFactory } from './index.js';

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
// Circular references only used for testing.
// Using require() to avoid TS complaints.
declare global {
  export const require: (id: string) => any;
}
const { JwtDecoder } = require('@dreamauth/jwt-decoder');
const { JwtFactory } = require('@dreamauth/jwt-factory');

describe('createJwk', () => {
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

  test('overrides', async () => {
    const jwkFactory = new JwkFactory();
    const jwk0 = await jwkFactory.create();
    const jwk1 = await jwkFactory.create({ algorithm: 'PS256', modulusLength: 4096 });

    expect(jwk0.privateKey.alg).toBe('RS256');
    expect(jwk0.privateKey.alg).toBe('RS256');
    expect(jwk1.privateKey.alg).toBe('PS256');
    expect(jwk1.privateKey.alg).toBe('PS256');
    expect(jwk0.privateKey.n?.length).toBe(342);
    expect(jwk1.privateKey.n?.length).toBe(683);
  }, 30_000);
});
