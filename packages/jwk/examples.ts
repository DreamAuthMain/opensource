import crypto from 'node:crypto';

import { JwkFactory, JwkImporter, type JwkLoader, JwkOIDCLoader } from '@dreamauth/jwk';

//
// Create JWKs
//

// Create a JWK factory instance.
const jwkFactory = new JwkFactory(crypto);

// Create a JWK RSA pair for encryption.
const jwkRsaEncryptionPair = await jwkFactory.createRSA('RSA-OAEP-256', 2048);
jwkRsaEncryptionPair.privateKey;
jwkRsaEncryptionPair.publicKey;

// Create a JWK RSA pair for signing.
const jwkRsaSigningPair = await jwkFactory.createRSA('RS256', 2048);
jwkRsaSigningPair.privateKey;
jwkRsaSigningPair.publicKey;

// Create a JWK ECC pair for signing.
const jwkEccPair = await jwkFactory.createECC('ES256');
jwkEccPair.privateKey;
jwkEccPair.publicKey;

// Create a JWK HMAC singleton for signing.
const jwkHmac = await jwkFactory.createHMAC('HS256');
jwkHmac.key;

//
// Load JWKs.
//

const loader: JwkLoader = {
  load: async (iss: string) => {
    // Load JWKs for the given issuer.
    return [];
  },
};

// An OIDC loader implementation is provided. It requires issuers be
// valid base URLs where a `/.well-known/openid-configuration` endpoint
// exists.
const oidcJwkLoader = new JwkOIDCLoader();
const jwks = await oidcJwkLoader.load('https://example.com');

//
// Import JWKs to CryptoKeys.
//

const importer = new JwkImporter(crypto.webcrypto);
const key = await importer.import(jwkRsaSigningPair.privateKey, 'sign');
