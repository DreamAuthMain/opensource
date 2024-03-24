import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';

import { assertGoodPassword } from './assert-good-password.js';
import { raise } from './errors.js';

const PASSWORD_FACTORY_CHARS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!?@#$%&*-+=~';

/**
 * Password factory based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class PasswordFactory {
  readonly #crypto: PlatformCryptoResolver;

  /**
   * Create a new password factory.
   */
  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  /**
   * Create a new cryptographically random password.
   */
  async create(length = 32): Promise<string> {
    const crypto = await this.#crypto();

    for (let i = 0; i < 10_000; i++) {
      const values = crypto.getRandomValues(new Uint16Array(Math.max(8, Math.trunc(length))));

      let password = '';

      try {
        for (const value of values) {
          password += PASSWORD_FACTORY_CHARS[value % PASSWORD_FACTORY_CHARS.length];
        }

        assertGoodPassword(password);

        return password;
      }
      catch {
        // Retry on non-good password.
      }
    }

    // This should never happen, but we don't want to endlessly loop, so it
    // has to be a possibility.
    return raise('PasswordCreationFailed');
  }
}
