import { base64UrlEncode } from './index.js';

describe('base64UrlEncode', () => {
  test('string', () => {
    expect(base64UrlEncode('Hello, world! 🤓')).toMatchInlineSnapshot(`"SGVsbG8sIHdvcmxkISDwn6ST"`);
  });

  test('bytes', () => {
    expect(base64UrlEncode(new TextEncoder().encode('Hello, world! 🤓'))).toMatchInlineSnapshot(
      `"SGVsbG8sIHdvcmxkISDwn6ST"`,
    );
  });
});
