/* eslint-disable @typescript-eslint/no-unused-vars */
import crypto from 'node:crypto';

import { type Jwk } from '@dreamauth/types';

import { JwtDecoder, JwtFactory, JwtVerifier } from './src/exports.js';

//
// Create JWTs.
//

const jwtFactory = new JwtFactory(crypto.webcrypto, 'https://issuer.com', {
  header: { foo: 'default header value' },
  payload: { bar: 'default payload value' },
  lifetime: 3600, // Default token lifetime in seconds.
});

// Load your private JWK from a secure location.
const privateJwk = {} as Jwk<'RS256', 'sign'>;

// Create a JWT, signed with the private JWK.
const jwt = await jwtFactory.create(privateJwk, {
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
    return [];
  },
});
const decoder = new JwtDecoder(verifier);

try {
  const decoded = await decoder.decode(jwt);
} catch (error) {
  // Errors are thrown when the JWT is malformed or fails verification.
}
