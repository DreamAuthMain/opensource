import { createRaise, DreamAuthError, type DreamAuthErrorOptions } from '@dreamauth/errors';

/**
 * Error codes for `@dreamauth/crypto`.
 */
export const CryptoErrorCodes = {
  NoCrypto: 'No WebCrypto implementation detected.',
};

/**
 * Error class for `@dreamauth/crypto`.
 */
export class CryptoError extends DreamAuthError<keyof typeof CryptoErrorCodes> {
  /**
   * Create a new CryptoError.
   */
  constructor(code: keyof typeof CryptoErrorCodes, options?: DreamAuthErrorOptions) {
    super(CryptoErrorCodes[code], code, options);
  }
}

/**
 * Raise a `CryptoError`.
 */
export const raise = createRaise(CryptoError);
