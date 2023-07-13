/* eslint-disable @typescript-eslint/no-unused-vars */
import crypto from 'node:crypto';

import { Pkce } from './src/exports.js';

const pkce = new Pkce(crypto.webcrypto);

//
// Create verifier.
//

const verifier = pkce.createVerifier(128);

//
// Create challenge.
//
const challenge = pkce.createChallenge(verifier);
