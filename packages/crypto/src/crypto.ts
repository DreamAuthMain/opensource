import { type webcrypto } from 'node:crypto';

import { raise } from './errors.js';

/**
 * Platform-agnostic crypto interface.
 */
export type PlatformCrypto = Omit<webcrypto.Crypto | Window['crypto'], 'getRandomValues'> & {
  /**
   * Returns cryptographically strong pseudo-random values.
   *
   * XXX: Limited to `Uint8Array`, `Uint16Array`, and `Uint32Array` which
   * should be compatible on all platforms.
   */
  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(typedArray: T): T;
};

/**
 * Platform-agnostic crypto resolve function which returns the platform's
 * `crypto` object.
 */
export type PlatformCryptoResolver = () => Promise<PlatformCrypto>;

/**
 * Get the platform's `crypto` object.
 */
export const getCrypto: PlatformCryptoResolver = async () => {
  return await import('node:crypto')
    .then((exports) => exports.webcrypto)
    .catch(() => window.crypto)
    .catch(() => raise('NoCrypto'));
};
