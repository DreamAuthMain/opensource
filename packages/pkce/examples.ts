import { Pkce } from './src/exports.js';

const pkce = new Pkce();

//
// Create verifier.
//

const verifier = await pkce.createVerifier(128);

//
// Create challenge.
//

const challenge = pkce.createChallenge(verifier);
