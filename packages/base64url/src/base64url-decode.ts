export const base64UrlDecode = (value: string): Uint8Array => {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(value.length + (value.length % 4 === 0 ? 0 : 4 - (value.length % 4)), '=');
  return new Uint8Array(Array.from(atob(base64)).map((char) => char.charCodeAt(0)));
};
