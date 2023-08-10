/* eslint-disable @typescript-eslint/no-var-requires */
import { type PartialCryptoProvider } from './partial-crypto.js';

export const cryptoProvider: PartialCryptoProvider<any> = async () => {
  try {
    return typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : typeof require !== 'undefined'
      ? require('node:crypto').webcrypto
      : await import('node:crypto').then(({ webcrypto }) => webcrypto);
  } catch (error) {
    throw new Error('No crypto implementation found', { cause: error });
  }
};