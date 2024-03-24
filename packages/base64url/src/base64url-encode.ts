/**
 * Encode a string or ArrayBuffer to a base64url string.
 */
export const base64UrlEncode = (value: string | ArrayBuffer): string => {
  const bytes = typeof value === 'string'
    ? new TextEncoder()
      .encode(value)
    : new Uint8Array(value);
  const string = bytes.reduce((result, byte) => result + String.fromCharCode(byte), '');
  return btoa(string)
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_')
    .replace(/=+$/u, '');
};
