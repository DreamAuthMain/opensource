import { base64UrlDecode, base64UrlEncode } from '@dreamauth/base64url';
import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';
import { argon2id } from 'hash-wasm/dist/argon2.umd.min.js';

export interface Argon2IdParams {
  readonly t: 'argon2id';
  /** Iterations (recommended minimum: 3) */
  readonly i: number;
  /** Length in bytes of output hash (recommended minimum: 32) */
  readonly l: number;
  /** Parallelism (recommended minimum: 4) */
  readonly p: number;
  /** Memory in MiB (recommended minimum: 64) */
  readonly m: number;
  /** Salt as Base64 or Base64URL encoded bytes (recommended minimum: 2 * `l` bytes) */
  readonly s?: string;
}

export interface PBKDF2Params {
  readonly t: 'pbkdf2';
  /** Iterations (recommended minimum: 600k) */
  readonly i: number;
  /** Length in bytes of output hash (recommended minimum: 14) */
  readonly l: number;
  /** Hash algorithm */
  readonly h: 'SHA-256' | 'SHA-512';
  /** Salt as Base64 or Base64URL encoded bytes (recommended minimum: 2 * `l` bytes) */
  readonly s?: string;
}

export class PasswordHashFactory {
  #crypto: PlatformCryptoResolver;

  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  async create(password: string, params: Argon2IdParams): Promise<[hash: string, params: Argon2IdParams]>;
  async create(password: string, params: PBKDF2Params): Promise<[hash: string, params: PBKDF2Params]>;
  async create(
    plaintextPassword: string,
    params: Argon2IdParams | PBKDF2Params,
  ): Promise<[hash: string, params: Argon2IdParams | PBKDF2Params]> {
    const crypto = await this.#crypto();
    const { t, s, l = 32 } = params;
    const password = new TextEncoder()
      .encode(plaintextPassword);
    const salt: Uint8Array = s ? base64UrlDecode(s) : crypto.getRandomValues(new Uint8Array(l * 2));

    if (t === 'pbkdf2') {
      const { i = 100_000, h = 'SHA-256' } = params;
      const cryptoKey = await crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, ['deriveBits']);
      const hashBytes = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: i, hash: h },
        cryptoKey,
        l * 8, // `l` bytes * 8 = bits
      );
      const hash = base64UrlEncode(hashBytes);
      const finalParams: PBKDF2Params = { t: 'pbkdf2', i, l, h, s: base64UrlEncode(salt) };

      return [hash, finalParams];
    }

    const { i = 2, p = 1, m = 20 } = params;
    const hashBytes = await argon2id({
      password,
      hashLength: l,
      iterations: i,
      parallelism: p,
      salt,
      memorySize: m * 1024, // `m` MiB * 1024 = KiB,
      outputType: 'binary',
    });
    const hash = base64UrlEncode(hashBytes);
    const finalParams: Argon2IdParams = { t: 'argon2id', i, l, p, m, s: base64UrlEncode(salt) };

    return [hash, finalParams];
  }
}
