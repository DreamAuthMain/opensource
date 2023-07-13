export const base64UrlEncode = (value: string | ArrayBuffer): string => {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  const string = bytes.reduce((result, byte) => result + String.fromCharCode(byte), '');
  return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
