import { JwkFactory } from '@dreamauth/jwk';
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest';

import { JwtErrorCodes } from './errors.js';
import { JwtDecoder } from './jwt-decoder.js';
import { JwtFactory } from './jwt-factory.js';
import { JwtVerifier } from './jwt-verifier.js';

describe('JwtFactory and JwtDecoder', () => {
  beforeEach(() => {
    vitest.useFakeTimers();
    vitest.setSystemTime(Date.now());
  });

  afterEach(() => {
    vitest.useRealTimers();
  });

  test('should create, decode, and verify a JWT', async () => {
    const jwkFactory = new JwkFactory();
    const jwtFactory = new JwtFactory('http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey);

    const jwtVerifier = new JwtVerifier(['http://localhost'], { loader: { load: async () => [jwks.publicKey] } });
    const jwtDecoder = new JwtDecoder(jwtVerifier);
    const decoded = await jwtDecoder.decode(jwt);

    expect(decoded).toMatchObject({
      header: {
        alg: 'RS256',
        kid: expect.stringMatching(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/),
        typ: 'JWT',
      },
      headerString: expect.stringMatching(/^[0-9a-zA-Z_-]+$/),
      payload: {
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'http://localhost',
      },
      payloadString: expect.stringMatching(/^[0-9a-zA-Z_-]+$/),
      signature: expect.stringMatching(/^[0-9a-zA-Z_-]+$/),
    });

    expect((decoded.payload.iat as number) < Date.now() / 1000).toBe(true);
    expect(decoded.payload.exp > Date.now() / 1000).toBe(true);
    expect(decoded.payload.exp - (decoded.payload.iat as number)).toBe(86_410);
  });

  test('fail verification if the JWT has an invalid signature', async () => {
    const jwkFactory = new JwkFactory();
    const jwtFactory = new JwtFactory('http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    const jwks2 = await jwkFactory.createRSA('RS256');
    const jwtVerifier = new JwtVerifier(['http://localhost'], {
      loader: { load: async () => [jwks2.publicKey] },
    });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow(JwtErrorCodes.InvalidSignature);
  });

  test('fail verification if the JWT is expired', async () => {
    const jwkFactory = new JwkFactory();
    const jwtFactory = new JwtFactory('http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    vitest.setSystemTime(Date.now() + 200_000);

    const jwtVerifier = new JwtVerifier(['http://localhost'], { loader: { load: async () => [jwks.publicKey] } });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow(JwtErrorCodes.Expired);
  });

  test('fail verification if the JWT has an invalid issuer', async () => {
    const jwkFactory = new JwkFactory();
    const jwtFactory = new JwtFactory('http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    const jwtVerifier = new JwtVerifier(['http://localhost2'], {
      loader: { load: async () => [jwks.publicKey] },
    });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow(JwtErrorCodes.InvalidIssuer);
  });

  test('fail verification if the JWT has an invalid issuer', async () => {
    const jwkFactory = new JwkFactory();
    const jwtFactory = new JwtFactory('http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100, payload: { nbf: Date.now() / 1000 + 1 } });

    const jwtVerifier = new JwtVerifier(['http://localhost'], { loader: { load: async () => [jwks.publicKey] } });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow(JwtErrorCodes.NotYetValid);
  });
});
