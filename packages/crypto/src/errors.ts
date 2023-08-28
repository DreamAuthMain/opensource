import { createRaise, DreamAuthError, type ErrorOptions } from '@dreamauth/errors';

export const CryptoErrorCodes = {
  NoCrypto: 'No WebCrypto implementation detected.',
};

export class CryptoError extends DreamAuthError<keyof typeof CryptoErrorCodes> {
  constructor(code: keyof typeof CryptoErrorCodes, options?: ErrorOptions) {
    super(CryptoErrorCodes[code], code, options);
  }
}

export const raise = createRaise(CryptoError);
