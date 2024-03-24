import { describe, expect, test } from 'vitest';

import { assertGoodPassword } from './assert-good-password.js';
import { PasswordError, type PasswordErrorCodes } from './errors.js';

describe('assert-good-password', () => {
  const good = ['Abcddf1!', '!1fddcbA'];
  const bad: [password: string, code: keyof typeof PasswordErrorCodes][] = [
    ['Abc123!', 'TooShort'],
    ['Abcdefg!', 'NumberRequired'],
    ['abcd123!', 'UpperCaseRequired'],
    ['ABCD123!', 'LowerCaseRequired'],
    ['Abcd1234', 'NonAlphaNumericRequired'],
    ['aaabcD1!', 'ExcessiveCharacterRepeat'],
  ];

  for (const password of good) {
    test(`password "${password}" is good`, () => {
      expect(() => assertGoodPassword(password)).not.toThrow();
    });
  }

  for (const [password, code] of bad) {
    test(`password "${password}" is bad (${code})`, () => {
      try {
        assertGoodPassword(password);
      }
      catch (error: any) {
        expect(error)
          .toBeInstanceOf(PasswordError);
        expect(error.code)
          .toBe(code);
      }

      expect.assertions(2);
    });
  }
});
