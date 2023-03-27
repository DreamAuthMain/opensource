# DreamAuth Base64Url Decode

Base64URL decode to byte array.

```ts
const bytes = base64UrlDecode('SGVsbG8sIHdvcmxkISDwn6ST');
const text = new TextDecoder().decode(bytes);
console.log(text); // Hello, world! 🤓
```
