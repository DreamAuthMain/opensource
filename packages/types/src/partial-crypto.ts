interface BaseCrypto {
  randomUUID(): string;
  getRandomValues(array: Uint8Array): Uint8Array;
  subtle: {
    generateKey(
      algorithm: RsaHashedKeyGenParams | EcKeyGenParams,
      extractable: true,
      keyUsages: ['encrypt', 'decrypt'] | ['verify', 'sign'],
    ): Promise<CryptoKeyPair>;
    exportKey(format: 'jwk', key: CryptoKey): Promise<JsonWebKey>;
    importKey(
      format: 'raw' | 'jwk',
      keyData: Uint8Array | JsonWebKey,
      algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams,
      extractable: false,
      keyUsages: ['verify'] | ['sign'] | ['encrypt'] | ['decrypt'] | ['deriveBits'],
    ): Promise<CryptoKey>;
    sign(
      algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
      key: CryptoKey,
      data: Uint8Array,
    ): Promise<ArrayBuffer>;
    verify(
      algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams,
      key: CryptoKey,
      signature: Uint8Array,
      data: Uint8Array,
    ): Promise<boolean>;
    encrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: Uint8Array): Promise<ArrayBuffer>;
    decrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: Uint8Array): Promise<ArrayBuffer>;
    deriveBits(algorithm: Pbkdf2Params, baseKey: CryptoKey, length: number): Promise<ArrayBuffer>;
    digest(algorithm: AlgorithmIdentifier, data: Uint8Array): Promise<ArrayBuffer>;
  };
}

export type PartialCrypto<TKey extends keyof BaseCrypto['subtle'] | Exclude<keyof BaseCrypto, 'subtle'> = never> = Pick<
  BaseCrypto,
  Extract<TKey, keyof BaseCrypto>
> & {
  subtle: Pick<BaseCrypto['subtle'], Extract<TKey, keyof BaseCrypto['subtle']>>;
};
