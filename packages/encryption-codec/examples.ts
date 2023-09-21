import { JwkFactory } from '@dreamauth/jwk';

import { EncryptionCodec } from './src/encryption-codec.js';

// You need a JWK RSA key pair to encrypt and decrypt data.
const jwkFactory = new JwkFactory();
// Only RSA-OAEP-256 is supported for encryption.
const { publicKey, privateKey } = await jwkFactory.createRSA('RSA-OAEP-256');

// Create an instance of the codec.
const codec = new EncryptionCodec();

// Encrypt data using the public key.
const bytes = new TextEncoder().encode('Hello, World!');
const encrypted = await codec.encrypt(publicKey, bytes);

// Decrypt data using the private key.
const decrypted = await codec.decrypt(privateKey, encrypted);
const text = new TextDecoder().decode(decrypted);

console.log(text); // Hello, World!
