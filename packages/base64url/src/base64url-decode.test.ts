import { describe, expect, test } from 'vitest';

import { base64UrlDecode } from './base64url-decode.js';

describe('base64UrlEncode', () => {
  test('decodes Base64URL', () => {
    const text = new TextDecoder()
      .decode(base64UrlDecode('8J-kkw'));
    expect(text)
      .toEqual('🤓');
  });

  test('decodes standard Base64 (non-URL)', () => {
    const text = new TextDecoder()
      .decode(base64UrlDecode('8J+kkw=='));
    expect(text)
      .toEqual('🤓');
  });
});
