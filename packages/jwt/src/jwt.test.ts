import crypto from 'node:crypto';

import { JwkFactory } from '@dreamauth/jwk';
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest';

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
    const jwkFactory = new JwkFactory(crypto.webcrypto);
    const jwtFactory = new JwtFactory(crypto.webcrypto, 'http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey);

    const jwtVerifier = new JwtVerifier(crypto.webcrypto, ['http://localhost'], { load: async () => [jwks.publicKey] });
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

  test('fail verification if the JWT is invalid', async () => {
    const jwkFactory = new JwkFactory(crypto.webcrypto);
    const jwtFactory = new JwtFactory(crypto.webcrypto, 'http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    const jwks2 = await jwkFactory.createRSA('RS256');
    const jwtVerifier = new JwtVerifier(crypto.webcrypto, ['http://localhost'], {
      load: async () => [jwks2.publicKey],
    });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow('invalid jwt');
  });

  test('fail verification if the JWT is expired', async () => {
    const jwkFactory = new JwkFactory(crypto.webcrypto);
    const jwtFactory = new JwtFactory(crypto.webcrypto, 'http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    vitest.setSystemTime(Date.now() + 200_000);

    const jwtVerifier = new JwtVerifier(crypto.webcrypto, ['http://localhost'], { load: async () => [jwks.publicKey] });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow('expired jwt');
  });

  test('fail verification if the JWT has invalid issuer', async () => {
    const jwkFactory = new JwkFactory(crypto.webcrypto);
    const jwtFactory = new JwtFactory(crypto.webcrypto, 'http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100 });

    const jwtVerifier = new JwtVerifier(crypto.webcrypto, ['http://localhost2'], {
      load: async () => [jwks.publicKey],
    });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow('invalid jwt iss claim');
  });

  test('fail verification if the JWT has invalid issuer', async () => {
    const jwkFactory = new JwkFactory(crypto.webcrypto);
    const jwtFactory = new JwtFactory(crypto.webcrypto, 'http://localhost');
    const jwks = await jwkFactory.createRSA('RS256');
    const jwt = await jwtFactory.create(jwks.privateKey, { lifetime: 100, payload: { nbf: Date.now() / 1000 + 1 } });

    const jwtVerifier = new JwtVerifier(crypto.webcrypto, ['http://localhost'], { load: async () => [jwks.publicKey] });
    const jwtDecoder = new JwtDecoder(jwtVerifier);

    await expect(() => jwtDecoder.decode(jwt)).rejects.toThrow('invalid jwt nbf claim');
  });
});
