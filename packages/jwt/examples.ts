import crypto from 'node:crypto';

import { JwkFactory } from '@dreamauth/jwk';
import { JwtDecoder, JwtFactory, JwtVerifier } from '@dreamauth/jwt';

// You need a private JWK for JWT signing, and a public JWK for JWT
// verification. These would normally be generated ahead of time, and
// rotated occasionally.
const jwkFactory = new JwkFactory(crypto.webcrypto);
const { publicKey, privateKey } = await jwkFactory.createRSA('RS256');

//
// Create JWTs.
//

const jwtFactory = new JwtFactory(crypto.webcrypto, 'https://issuer.com', {
  header: { foo: 'default header value' },
  payload: { bar: 'default payload value' },
  lifetime: 3600, // Default token lifetime in seconds.
});

// Create a JWT, signed with the private JWK.
const jwt = await jwtFactory.create(privateKey, {
  header: { foo: 'override header value' },
  payload: { bar: 'override payload value' },
  lifetime: 1800, // Override token lifetime in seconds.
});

//
// Decode and verify the JWT.
//

const verifier = new JwtVerifier(crypto.webcrypto, ['https://issuer.com'], {
  load: async (iss: string) => {
    // Load all public JWKs for the given issuer.
    return [publicKey];
  },
});
const decoder = new JwtDecoder(verifier);

try {
  const decoded = await decoder.decode(jwt);
} catch (error) {
  // Errors are thrown when the JWT is malformed or fails verification.
}
