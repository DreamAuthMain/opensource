# DreamAuth Base64URL

## Base64URL Decode

Decode Base64URL encoded string to byte array.

```ts
const bytes = base64UrlDecode('8J-kkw');
const text = new TextDecoder().decode(bytes);
console.log(text); // 🤓
```

Also supports decoding regular Base64 (non-URL) strings.

```ts
const bytes = base64UrlDecode('8J+kkw==');
const text = new TextDecoder().decode(bytes);
console.log(text); // 🤓
```

## Base64URL Encode

Base64URL encode strings or byte arrays.

```ts
const encoded = base64UrlEncode('string');
const encoded = base64UrlEncode(new Uint8Array([0xde, 0xea, 0xbe, 0xef]));
```
