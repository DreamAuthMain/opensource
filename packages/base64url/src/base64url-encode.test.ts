import { describe, expect, test } from 'vitest';

import { base64UrlEncode } from './base64url-encode.js';

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
