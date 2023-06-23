import { webcrypto } from 'node:crypto';

import { describe, expect, test } from 'vitest';

import { JwkFactory } from './jwk-factory.js';
import { JwkImporter } from './jwk-importer.js';

describe('JwkFactory and JwkImporter', () => {
  (
    [
      ['RS256', 'RSASSA-PKCS1-v1_5', 'SHA-256', 'createRSA'],
      ['PS512', 'RSA-PSS', 'SHA-512', 'createRSA'],
    ] as const
  ).forEach(([alg, name, hash, method]) => {
    test(`create and import ${alg}`, async () => {
      const jwkFactory = new JwkFactory(webcrypto);
      const jwkImporter = new JwkImporter(webcrypto);
      const jwk = await jwkFactory[method](alg);
      const publicKey = await jwkImporter.import(jwk.publicKey, 'verify');
      const privateKey = await jwkImporter.import(jwk.privateKey, 'sign');
      expect(publicKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(publicKey).toMatchObject({
        type: 'public',
        usages: ['verify'],
        extractable: false,
        algorithm: {
          name: name,
          hash: { name: hash },
          modulusLength: 2048,
        },
      });
      expect(privateKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(privateKey).toMatchObject({
        type: 'private',
        usages: ['sign'],
        extractable: false,
        algorithm: {
          name: name,
          hash: { name: hash },
          modulusLength: 2048,
        },
      });
    });
  });

  ([['RSA-OAEP-256', 'RSA-OAEP', 'SHA-256', 'createRSA']] as const).forEach(([alg, name, hash, method]) => {
    test(`create and import ${alg}`, async () => {
      const jwkFactory = new JwkFactory(webcrypto);
      const jwkImporter = new JwkImporter(webcrypto);
      const jwk = await jwkFactory[method](alg);
      const publicKey = await jwkImporter.import(jwk.publicKey, 'encrypt');
      const privateKey = await jwkImporter.import(jwk.privateKey, 'decrypt');
      expect(publicKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(publicKey).toMatchObject({
        type: 'public',
        usages: ['encrypt'],
        extractable: false,
        algorithm: {
          name: name,
          hash: { name: hash },
          modulusLength: 2048,
        },
      });
      expect(privateKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(privateKey).toMatchObject({
        type: 'private',
        usages: ['decrypt'],
        extractable: false,
        algorithm: {
          name: name,
          hash: { name: hash },
          modulusLength: 2048,
        },
      });
    });
  });

  ([['ES256', 'ECDSA', 'P-256', 'createECC']] as const).forEach(([alg, name, curve, method]) => {
    test(`create and import ${alg}`, async () => {
      const jwkFactory = new JwkFactory(webcrypto);
      const jwkImporter = new JwkImporter(webcrypto);
      const jwk = await jwkFactory[method](alg);
      const publicKey = await jwkImporter.import(jwk.publicKey, 'verify');
      const privateKey = await jwkImporter.import(jwk.privateKey, 'sign');
      expect(publicKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(publicKey).toMatchObject({
        type: 'public',
        usages: ['verify'],
        extractable: false,
        algorithm: {
          name: name,
          namedCurve: curve,
        },
      });
      expect(privateKey).toBeInstanceOf(webcrypto.CryptoKey);
      expect(privateKey).toMatchObject({
        type: 'private',
        usages: ['sign'],
        extractable: false,
        algorithm: {
          name: name,
          namedCurve: curve,
        },
      });
    });
  });

  ([['HS256', 'HMAC', 'SHA-256', 'createHMAC']] as const).forEach(([alg, name, hash, method]) => {
    test(`create and import ${alg}`, async () => {
      const jwkFactory = new JwkFactory(webcrypto);
      const jwkImporter = new JwkImporter(webcrypto);
      const jwk = await jwkFactory[method](alg);
      const signKey = await jwkImporter.import(jwk.key, 'sign');
      const verifyKey = await jwkImporter.import(jwk.key, 'verify');

      expect(signKey.usages).toEqual(['sign']);
      expect(verifyKey.usages).toEqual(['verify']);
      [signKey, verifyKey].forEach((key) => {
        expect(key).toBeInstanceOf(webcrypto.CryptoKey);
        expect(key).toMatchObject({
          type: 'secret',
          extractable: false,
          algorithm: {
            name: name,
            hash: { name: hash },
          },
        });
      });
    });
  });
});
