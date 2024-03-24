import { createRaise, DreamAuthError } from '@dreamauth/errors';

/**
 * Error codes for `@dreamauth/password`.
 */
export const PasswordErrorCodes = {
  TooShort: 'Passwords must be at least 8 characters long.',
  NumberRequired: 'Passwords must contain at least one number.',
  LowerCaseRequired: 'Passwords must contain at least one lowercase letter.',
  UpperCaseRequired: 'Passwords must contain at least one uppercase letter.',
  NonAlphaNumericRequired: 'Passwords must contain at least one non-alphanumeric character.',
  ExcessiveCharacterRepeat: 'Passwords must not contain the same character more than two times in a row.',
  PasswordCreationFailed: 'Failed to create a good password.',
};

/**
 * Error class for `@dreamauth/password`.
 */
export class PasswordError extends DreamAuthError<keyof typeof PasswordErrorCodes> {
  /**
   * Create a new PasswordError.
   */
  constructor(code: keyof typeof PasswordErrorCodes) {
    super(PasswordErrorCodes[code], code);
  }
}

/**
 * Raise a PasswordError.
 */
export const raise = createRaise(PasswordError);
