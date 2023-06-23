# DreamAuth Password

## Password Hash Factory

Generate password hashes using one of the approved safe algorithms.

### Algorithms

- `Argon2id` (recommended: side-channel and GPU-based attack resistant)
  - Using [hash-wasm](https://www.npmjs.com/package/hash-wasm).
  - Estimated cracking cost in 2021 (8 char, uppercase, lowercase, digits)
    - 3 iterations, 4 parallelism, 64MiB ≈ 1.8m USD
    - 10 iterations, 4 parallelism, 512MiB ≈ 53.7m USD
- `PBKDF2` with SHA-256/512 (FIPS-140 compliant)
  - Using [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)
  - Estimated cracking cost in 2021 (8 char, uppercase, lowercase, digits)
    - 100k iterations ≈ 35k USD
    - 600k iterations ≈ 220k USD

See also:

- [OWASP password cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [1Password cracking challenge](https://blog.1password.com/cracking-challenge-update/).

#### Argon2id

Generate a base64 encoded Argon2id password hash. Argon2id is considered to be the current best

```ts
const passwordHashFactory = new PasswordHashFactory(crypto);

// Using an existing salt to match an existing password.
const [hash] = await passwordHashFactory.create(password, {
  t: 'argon2id',
  i: 3, // iterations
  l: 32, // length of returned hash in bytes
  p: 4, // parallelism
  m: 64, // memory size in MiB
  s: salt, // Base64 encoded bytes
});

// Generating a new salt (64 byte, base64 encoded) for a new password.
const [hash, newSalt] = await passwordHashFactory.create(password, {
  t: 'argon2id',
  i: 3, // iterations
  l: 32, // length of returned hash in bytes
  p: 4, // parallelism
  m: 64, // memory size in MiB
});
```

Estimated cost of generating the above hash in AWS lambda is $0.000001.

#### PBKDF2

Generate a base64 encoded PBKDF2 password hash using SHA-256 HMAC derivation.

```ts
const passwordHashFactory = new PasswordHashFactory(crypto);

// Using an existing salt to match an existing password.
const [hash] = await passwordHashFactory.create(password, {
  t: 'pbkdf2',
  i: 600_000, // iterations
  l: 32, // length of returned hash in bytes
  h: 'SHA-256',
  s: salt, // Base64 encoded bytes
});

// Generating a new salt (64 byte, base64 encoded) for a new password.
const [hash, newSalt] = await passwordHashFactory.create(password, {
  t: 'pbkdf2',
  i: 600_000, // iterations
  l: 32, // length of returned hash in bytes
  h: 'SHA-256',
});
```

Estimated cost of generating the above hash in AWS lambda is $0.000001.

### Security Recommendations

- Output hash size should be at least 32 bytes.
- Salt size should be at least twice the output hash size.
- Passwords can be rehashed when a user successfully signs in if hashing requirements have changed. This is the only time when the original (un-hashed) password is available.
