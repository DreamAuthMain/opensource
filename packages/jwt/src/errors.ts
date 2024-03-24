import { createRaise, DreamAuthError, type DreamAuthErrorOptions } from '@dreamauth/errors';

/**
 * Error codes for `@dreamauth/jwt`.
 */
export const JwtErrorCodes = {
  Expired: 'JWT is expired',
  Invalid: 'JWT is invalid',
  InvalidIssuer: 'JWT issuer is invalid',
  InvalidSignature: 'JWT signature is invalid',
  NotYetValid: 'JWT is not yet valid',
  UnsupportedAlgorithm: 'JWT algorithm is unsupported',
} as const;

/**
 * Error class for `@dreamauth/jwt`.
 */
export class JwtError extends DreamAuthError<keyof typeof JwtErrorCodes> {
  /**
   * Create a new JwtError.
   */
  constructor(code: keyof typeof JwtErrorCodes, options?: DreamAuthErrorOptions) {
    super(JwtErrorCodes[code], code, options);
  }
}

/**
 * Raise a JwtError.
 */
export const raise = createRaise(JwtError);
