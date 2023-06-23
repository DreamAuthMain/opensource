export interface SubtleCryptoBase {
  generateKey(
    algorithm: HmacKeyGenParams | RsaHashedKeyGenParams | EcKeyGenParams,
    extractable: true,
    keyUsages: ['encrypt', 'decrypt'] | ['sign', 'verify'],
  ): Promise<CryptoKeyPair | CryptoKey>;
  exportKey(format: 'jwk', key: CryptoKey): Promise<JsonWebKey>;
  importKey(
    format: 'raw' | 'jwk',
    keyData: Uint8Array | JsonWebKey,
    algorithm: AlgorithmIdentifier | HmacImportParams | RsaHashedImportParams | EcKeyImportParams,
    extractable: false,
    keyUsages: ['sign'] | ['verify'] | ['decrypt'] | ['encrypt'] | ['deriveBits'],
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
}

export interface CryptoBase {
  randomUUID(): string;
  getRandomValues(array: Uint8Array): Uint8Array;
  subtle: SubtleCryptoBase;
}

export type PartialCrypto<TKey extends keyof SubtleCryptoBase | Exclude<keyof CryptoBase, 'subtle'> = never> = Pick<
  CryptoBase,
  Extract<TKey, keyof CryptoBase>
> & { subtle: Pick<SubtleCryptoBase, Extract<TKey, keyof SubtleCryptoBase>> };
