# DreamAuth Password

Generate password hashes.

See the [examples](examples.ts).

## Algorithms

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

## Security Recommendations

- Output hash size should be at least 32 bytes.
- Salt size should be at least twice the output hash size.
- Passwords can be rehashed when a user successfully signs in if hashing requirements have changed. This is the only time when the original (un-hashed) password is available.
