import { base64UrlEncode } from '@dreamauth/base64url';
import { type PartialCrypto } from '@dreamauth/types';

export class Pkce {
  #crypto: PartialCrypto<'getRandomValues' | 'digest'>;

  constructor(crypto: PartialCrypto<'getRandomValues' | 'digest'>) {
    this.#crypto = crypto;
  }

  async create(length = 96): Promise<[verifier: string, challenge: string]> {
    const verifier = this.createVerifier(length);
    const challenge = await this.createChallenge(verifier);
    return [verifier, challenge];
  }

  createVerifier(length = 96): string {
    const bytes = this.#crypto.getRandomValues(new Uint8Array(length));
    return base64UrlEncode(bytes);
  }

  async createChallenge(verifier: string): Promise<string> {
    const bytes = new TextEncoder().encode(verifier);
    const hash = await this.#crypto.subtle.digest('SHA-256', bytes);
    return base64UrlEncode(hash);
  }
}
