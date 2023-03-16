import { JwkFactory } from '@isoauth/jwk-factory';
import { JwkResolver } from '@isoauth/jwk-resolver';
import { JwtFactory } from '@isoauth/jwt-factory';

import { JwtDecodeError, JwtDecoder } from './index.js';

describe('JwtDecoder', () => {
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

  ([undefined, jest.fn()] as const).forEach((onFailure) => {
    describe(`errors ${onFailure ? 'with' : 'without'} failure handler`, () => {
      test(JwtDecodeError.malformed, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [header = '', payload = '', signature = ''] = jwt.value.split('.', 3);
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(`Zm9v.${payload}.${signature}`)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.malformed, expect.any(SyntaxError));

        await expect(decoder.decode(`${header}.Zm9v.${signature}`)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.malformed, expect.any(SyntaxError));
      });

      test(`${JwtDecodeError.invalid} header`, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [, payload = '', signature = ''] = jwt.value.split('.', 3);
        const token = `e30.${payload}.${signature}`;
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(token)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.invalid);
      });

      test(`${JwtDecodeError.invalid} header kid`, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [, payload = '', signature = ''] = jwt.value.split('.', 3);
        const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6MH0.${payload}.${signature}`;
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(token)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.invalid);
      });

      test(`${JwtDecodeError.invalid} payload`, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [header, , signature = ''] = jwt.value.split('.', 3);
        const token = `${header}.bnVsbA.${signature}`;
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(token)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.invalid);
      });

      test(JwtDecodeError.expired, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [header, , signature = ''] = jwt.value.split('.', 3);
        const token = `${header}.eyJleHAiOjB9.eyJleHAiOjB9.${signature}`;
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(token)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.expired);
      });

      test(JwtDecodeError.algorithm_unsupported, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const [, payload, signature = ''] = jwt.value.split('.', 3);
        const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJYWDI1NiJ9.${payload}.eyJleHAiOjB9.${signature}`;
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(token)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.algorithm_unsupported);
      });

      test(JwtDecodeError.algorithm_mismatch, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const otherJwk = await jwkFactory.create({ algorithm: 'RS384' });
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => otherJwk.publicKey || otherJwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(jwt.value)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.algorithm_mismatch);
      });

      test(JwtDecodeError.key_not_found, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const decoder = new JwtDecoder({ jwkResolver: { resolve: async () => undefined }, onFailure });

        await expect(decoder.decode(jwt.value)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.key_not_found);
      });

      test(JwtDecodeError.unverified, async () => {
        const jwkFactory = new JwkFactory();
        const jwk = await jwkFactory.create();
        const otherJwk = await jwkFactory.create();
        const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
        const jwt = await jwtFactory.create();
        const decoder = new JwtDecoder({
          jwkResolver: { resolve: async () => otherJwk.publicKey || otherJwk.privateKey },
          onFailure,
        });

        await expect(decoder.decode(jwt.value)).resolves.toBeNull();
        onFailure && expect(onFailure).toHaveBeenLastCalledWith(JwtDecodeError.unverified);
      });
    });
  });

  test('no JWK resolver', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
    const jwt = await jwtFactory.create();
    const token = jwt.value.replace(/(?=<\.)[^.]+$/, (await jwtFactory.create({ payload: { foo: 'bar' } })).signature);
    const decoder = new JwtDecoder();

    await expect(decoder.decode(token)).resolves.toBeTruthy();
  });

  test('overrides', async () => {
    const jwkFactory = new JwkFactory();
    const jwk = await jwkFactory.create();
    const jwtFactory = new JwtFactory({ jwkLoader: { load: async () => jwk.privateKey } });
    const jwt = await jwtFactory.create();
    const decoder = new JwtDecoder({ jwkResolver: { resolve: async () => null } });
    const decoded = await decoder.decode(jwt.value, {
      jwkResolver: { resolve: async () => jwk.publicKey ?? jwk.privateKey },
    });

    expect(decoded).toBeTruthy();
  });

  test('compatible with jwk-resolver', () => {
    // No assertions necessary. Just make sure the types match.
    new JwtDecoder({ jwkResolver: new JwkResolver({ issuers: [] }) });
  });
});
