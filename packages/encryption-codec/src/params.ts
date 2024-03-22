/**
 * Encryption/Decryption parameters for various algorithms.
 */
export const PARAMS = {
  'RSA-OAEP-256': {
    name: 'RSA-OAEP',
  },
} as const satisfies Record<string, AlgorithmIdentifier>;
