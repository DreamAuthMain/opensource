import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';

export const PASSWORD_FACTORY_CHARS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!?@#$%&*-+=~';

export class PasswordFactory {
  readonly #crypto: PlatformCryptoResolver;

  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  async create(length = 32): Promise<string> {
    const crypto = await this.#crypto();
    const values = crypto.getRandomValues(new Uint16Array(Math.max(8, Math.trunc(length))));
    let password = '';

    for (const value of values) {
      password += PASSWORD_FACTORY_CHARS[value % PASSWORD_FACTORY_CHARS.length];
    }

    return password;
  }
}
