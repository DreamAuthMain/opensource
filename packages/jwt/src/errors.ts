import { createRaise, DreamAuthError, type ErrorOptions } from '@dreamauth/errors';

export const JwtErrorCodes = {
  Expired: 'JWT is expired',
  Invalid: 'JWT is invalid',
  InvalidIssuer: 'JWT issuer is invalid',
  InvalidSignature: 'JWT signature is invalid',
  NotYetValid: 'JWT is not yet valid',
  UnsupportedAlgorithm: 'JWT algorithm is unsupported',
} as const;

export class JwtError extends DreamAuthError<keyof typeof JwtErrorCodes> {
  constructor(code: keyof typeof JwtErrorCodes, options?: ErrorOptions) {
    super(JwtErrorCodes[code], code, options);
  }
}

export const raise = createRaise(JwtError);
