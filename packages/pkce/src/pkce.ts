import { base64UrlEncode } from '@dreamauth/base64url';
import { type PartialCrypto } from '@dreamauth/types';

export class Pkce {
  #crypto: PartialCrypto<'getRandomValues' | 'digest'>;

  constructor(crypto: PartialCrypto<'getRandomValues' | 'digest'>) {
    this.#crypto = crypto;
  }

  createVerifier(length = 128): string {
    const bytes = this.#crypto.getRandomValues(new Uint8Array(length));
    return base64UrlEncode(bytes);
  }

  async createChallenge(verifier: string): Promise<string> {
    // The challenge intentionally uses the bytes of the verifier string,
    // WITHOUT Base64URL decoding it.
    const bytes = new TextEncoder().encode(verifier);
    const hash = await this.#crypto.subtle.digest('SHA-256', bytes);
    return base64UrlEncode(hash);
  }
}
