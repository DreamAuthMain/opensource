import { PasswordFactory, PasswordHashFactory } from './src/index.js';

const hashFactory = new PasswordHashFactory();

//
// Argon2id (recommended)
//

// The recommended Argon2id minimums are used here.
const [hash0, params0] = await hashFactory.create('password', {
  t: 'argon2id',
  i: 3, // iterations
  l: 32, // length of returned hash in bytes
  p: 4, // parallelism
  m: 64, // memory size in MiB
});

// Store the hash and params in a secure location.

// Use the params to verify a password later.
const [verificationHash0] = await hashFactory.create('password', params0);

if (hash0 === verificationHash0) {
  // The passwords match.
}

//
// PBKDF2
//

// The recommended PBKDF2 minimums are used here.
const [hash1, params1] = await hashFactory.create('password', {
  t: 'pbkdf2',
  i: 600_000, // iterations
  l: 32, // length of returned hash in bytes
  h: 'SHA-256',
});

// Store the hash and params in a secure location.

// Use the params to verify a password later.
const [verificationHash1] = await hashFactory.create('password', params1);

if (hash1 === verificationHash1) {
  // The passwords match.
}

const passwordFactory = new PasswordFactory();
const passwordLength32 = await passwordFactory.create();
const passwordLength64 = await passwordFactory.create(64);
