import { base64UrlEncode } from '@dreamauth/base64url';
import { getCrypto, type PlatformCryptoResolver } from '@dreamauth/crypto';

/**
 * Proof Key for Code Exchange (PKCE) factory based on
 * [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 */
export class Pkce {
  #crypto: PlatformCryptoResolver;

  /**
   * Create a new PKCE factory.
   */
  constructor(crypto = getCrypto) {
    this.#crypto = crypto;
  }

  /**
   * Create a new PKCE verifier.
   */
  readonly createVerifier = async (length = 128): Promise<string> => {
    const crypto = await this.#crypto();
    const bytes = crypto.getRandomValues(new Uint8Array(length));

    return base64UrlEncode(bytes);
  };

  /**
   * Create a new PKCE challenge for a verifier.
   */
  readonly createChallenge = async (verifier: string): Promise<string> => {
    const crypto = await this.#crypto();
    /*
     * The challenge intentionally uses the bytes of the verifier string,
     * WITHOUT Base64URL decoding it.
     */
    const bytes = new TextEncoder()
      .encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', bytes);

    return base64UrlEncode(hash);
  };
}
