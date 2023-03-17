import { base64UrlDecode } from './index.js';

describe('base64UrlEncode', () => {
  test('string', () => {
    expect(new TextDecoder().decode(base64UrlDecode('SGVsbG8sIHdvcmxkISDwn6ST'))).toMatchInlineSnapshot(
      `"Hello, world! 🤓"`,
    );
    expect(new TextDecoder().decode(base64UrlDecode('SGVsbG8sIHdvcmxkISDwn6STIA'))).toMatchInlineSnapshot(
      `"Hello, world! 🤓 "`,
    );
  });

  test('bytes', () => {
    expect(Array.from(base64UrlDecode('SGVsbG8sIHdvcmxkISDwn6ST'))).toEqual(
      Array.from(new TextEncoder().encode('Hello, world! 🤓')),
    );
  });
});
