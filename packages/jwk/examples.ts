import { JwkFactory } from './src/exports.js';

// Create a JWK factory instance.
const jwkFactory = new JwkFactory(crypto);

// Create a JWK.
const jwk = await jwkFactory.createRSA('RS256', 2048);

// A private key is always generated.
jwk.privateKey;

// A public key might be undefined if an HMAC algorithm is used.
jwk.publicKey;
