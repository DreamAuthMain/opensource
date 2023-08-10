import { base64UrlEncode } from '@dreamauth/base64url';
import { cryptoProvider, type PartialCryptoProvider } from '@dreamauth/crypto';

export class Pkce {
  #crypto: PartialCryptoProvider<'getRandomValues' | 'digest'>;

  constructor(crypto: PartialCryptoProvider<'getRandomValues' | 'digest'> = cryptoProvider) {
    this.#crypto = crypto;
  }

  readonly createVerifier = async (length = 128): Promise<string> => {
    const crypto = await this.#crypto();
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return base64UrlEncode(bytes);
  };

  readonly createChallenge = async (verifier: string): Promise<string> => {
    const crypto = await this.#crypto();
    // The challenge intentionally uses the bytes of the verifier string,
    // WITHOUT Base64URL decoding it.
    const bytes = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return base64UrlEncode(hash);
  };
}
