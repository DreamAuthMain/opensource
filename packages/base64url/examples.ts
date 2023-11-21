import { base64UrlDecode, base64UrlEncode } from './src/index.js';

//
// Decode Base64URL encoded string to byte array.
//

const bytes0 = base64UrlDecode('8J-kkw');
const text0 = new TextDecoder().decode(bytes0);
console.log(text0); // 🤓

// Also supports decoding regular Base64 (non-URL) strings.
const bytes1 = base64UrlDecode('8J+kkw==');
const text1 = new TextDecoder().decode(bytes1);
console.log(text1); // 🤓

//
// Encode Base64URL strings or byte arrays.
//

const encoded0 = base64UrlEncode('string');
console.log(encoded0); // c3RyaW5n

// Also supports encoding byte arrays.
const encoded1 = base64UrlEncode(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
console.log(encoded1); // 3q2-7w
