import { Pkce } from '@dreamauth/pkce';

const pkce = new Pkce();

//
// Create verifier.
//

const verifier = await pkce.createVerifier(128);

//
// Create challenge.
//

const challenge = pkce.createChallenge(verifier);
