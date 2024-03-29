import { raise } from './errors.js';

export const assertGoodPassword = (password: string): void => {
  if (password.length < 8) raise('TooShort');
  if (!/\d/u.test(password)) raise('NumberRequired');
  if (!/[a-z]/u.test(password)) raise('LowerCaseRequired');
  if (!/[A-Z]/u.test(password)) raise('UpperCaseRequired');
  if (!/[^a-z\d]/iu.test(password)) raise('NonAlphaNumericRequired');
  if (/(.)\1{2}/u.test(password)) raise('ExcessiveCharacterRepeat');
};
